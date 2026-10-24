#!/usr/bin/env node
// Mirror review page: find the review page that a pull request adds or changes in
// .mirror/features/, and link it in one pull request comment. The action attaches the
// page to the Actions run, unzipped, so that the link opens it in the browser.
// No dependencies: Node 20 and git only.

import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const MARKER = '<!-- mirror-review-page -->';

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

// The review pages that `head` adds or changes in <mirrorDir>/features/, compared with `base`.
export function reviewPages(base, head, mirrorDir, cwd) {
  return git(['diff', '--name-only', '--diff-filter=AM', '--no-renames', base, head, '--', `${mirrorDir}/features/`], cwd)
    .split('\n').filter((p) => p.endsWith('.html'));
}

// The page to attach: the newest one, which has the highest number.
export function newestPage(pages) {
  return [...pages].sort().at(-1) ?? null;
}

export function render({ name, url, sha }) {
  const lines = [MARKER, '## 🪞 Mirror review page', ''];
  if (!url) {
    lines.push('This pull request adds no review page to `.mirror/features/`.');
    return lines.join('\n') + '\n';
  }
  lines.push(
    `Open the review page of this pull request: **[${name}](${url})**`, '',
    'It shows each flow and page that this pull request adds, changes or removes. Review the intent first, then the code.', '',
    `<sub>${sha ? `For ${sha.slice(0, 7)}. ` : ''}The page is a file of the Actions run. It opens in the browser, and is kept as long as the run artifacts of this repository.</sub>`,
  );
  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------- GitHub

async function api(method, url, token, body) {
  const res = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`, accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28', 'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${url}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

async function findComment(issue, token) {
  for (let page = 1; ; page++) {
    const comments = await api('GET', `${issue}/comments?per_page=100&page=${page}`, token);
    const found = comments.find((c) => c.body?.startsWith(MARKER));
    if (found) return found;
    if (comments.length < 100) return null;
  }
}

// ---------------------------------------------------------------- main

function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

// Step 1: find the review page, and write it to a file for the upload step.
async function prepare() {
  const env = process.env;
  if (!env.MIRROR_BASE) throw new Error('No base revision. Run the action on a pull_request event, or set the base input.');
  const head = env.MIRROR_HEAD || 'HEAD';
  const mirrorDir = (env.MIRROR_DIR || '.mirror').replace(/\/+$/, '');
  const page = newestPage(reviewPages(env.MIRROR_BASE, head, mirrorDir, process.cwd()));
  if (!page) return;
  const file = join(mkdtempSync(join(tmpdir(), 'mirror-review-')), basename(page));
  writeFileSync(file, execFileSync('git', ['show', `${head}:${page}`], { maxBuffer: 256 * 1024 * 1024 }));
  setOutput('file', file);
  setOutput('name', basename(page, '.html'));
}

// Step 2: post or update the comment.
async function comment() {
  const env = process.env;
  const repo = env.GITHUB_REPOSITORY;
  const pr = env.MIRROR_PR;
  if (!pr || !repo) throw new Error('Run the action on a pull_request event.');
  const url = env.MIRROR_URL || '';
  const body = render({ name: env.MIRROR_NAME, url, sha: env.MIRROR_HEAD_SHA });
  setOutput('url', url);
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, body.replace(MARKER + '\n', ''));
  const issue = `${env.GITHUB_API_URL || 'https://api.github.com'}/repos/${repo}/issues/${pr}`;
  const existing = await findComment(issue, env.MIRROR_TOKEN);
  if (existing) await api('PATCH', existing.url, env.MIRROR_TOKEN, { body });
  else if (url) await api('POST', `${issue}/comments`, env.MIRROR_TOKEN, { body });
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const command = { prepare, comment }[process.argv[2]];
  if (!command) {
    console.log('Usage: review-page.mjs prepare|comment');
    process.exit(2);
  }
  command().catch((err) => {
    // A pull request from a fork gets a read-only token: it cannot comment.
    // Warn, and do not fail the checks of the pull request.
    console.log(`::warning::Mirror could not link the review page: ${err.message}`);
  });
}
