#!/usr/bin/env node
// Mirror review page: publish the review pages that a pull request adds or changes in
// .mirror/features/, and link them in one pull request comment. The page goes to GitHub
// Pages when the repository has a Pages site, else it is a file of the Actions run.
// No dependencies: Node 20 and git only.

import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const MARKER = '<!-- mirror-review-page -->';
const BOT = ['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com'];

function git(args, cwd, input) {
  return execFileSync('git', args, { cwd, input, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] });
}

// The review pages that `head` adds or changes in <mirrorDir>/features/, compared with `base`.
export function reviewPages(base, head, mirrorDir, cwd) {
  return git(['diff', '--name-only', '--diff-filter=AM', '--no-renames', base, head, '--', `${mirrorDir}/features/`], cwd)
    .split('\n').filter((p) => p.endsWith('.html'));
}

// Commit the change that `apply(dir)` makes to `branch`, and push it. Retry when another
// pull request pushed to the same branch first.
export function updateBranch(branch, message, apply, cwd, { remote = 'origin', create = true } = {}) {
  for (let attempt = 1; ; attempt++) {
    const dir = mkdtempSync(join(tmpdir(), 'mirror-pages-'));
    try {
      git(['worktree', 'add', '--detach', '--quiet', dir], cwd);
      let exists = true;
      try { git(['fetch', '--no-tags', '--quiet', '--depth=1', remote, branch], dir); } catch { exists = false; }
      if (exists) git(['checkout', '--quiet', '-B', branch, 'FETCH_HEAD'], dir);
      else if (!create) return false;
      else { git(['checkout', '--quiet', '--orphan', branch], dir); git(['rm', '-rfq', '--ignore-unmatch', '.'], dir); }
      // Serve the files as they are, without Jekyll.
      writeFileSync(join(dir, '.nojekyll'), '');
      apply(dir);
      git(['add', '-A'], dir);
      if (!git(['status', '--porcelain'], dir).trim()) return false;
      git([...BOT, 'commit', '--quiet', '-m', message], dir);
      try {
        git(['push', '--quiet', remote, `HEAD:refs/heads/${branch}`], dir);
        return true;
      } catch (err) {
        if (attempt >= 4) throw err;
      }
    } finally {
      try { git(['worktree', 'remove', '--force', dir], cwd); } catch { rmSync(dir, { recursive: true, force: true }); }
    }
  }
}

export function publish({ pages, pr, head, branch, cwd, remote }) {
  return updateBranch(branch, `Mirror review page of #${pr}`, (dir) => {
    const target = join(dir, `pr-${pr}`);
    rmSync(target, { recursive: true, force: true });
    mkdirSync(target, { recursive: true });
    for (const page of pages) {
      writeFileSync(join(target, basename(page)), execFileSync('git', ['show', `${head}:${page}`], { cwd, maxBuffer: 256 * 1024 * 1024 }));
    }
  }, cwd, { remote });
}

export function unpublish({ pr, branch, cwd, remote }) {
  return updateBranch(branch, `Remove the Mirror review page of #${pr}`, (dir) => {
    rmSync(join(dir, `pr-${pr}`), { recursive: true, force: true });
  }, cwd, { remote, create: false });
}

export function render({ links, sha, artifact = false }) {
  const lines = [MARKER, '## 🪞 Mirror review page', ''];
  if (!links.length) {
    lines.push('This pull request adds no review page to `.mirror/features/`.');
    return lines.join('\n') + '\n';
  }
  lines.push(links.length === 1 ? 'Open the review page of this pull request:' : 'Open the review pages of this pull request:', '');
  for (const { name, url } of links) lines.push(`- **[${name}](${url})**`);
  lines.push('', 'It shows each flow and page that this pull request adds, changes or removes. Review the intent first, then the code.');
  const note = artifact
    ? 'The page is a file of the Actions run of this commit. It opens in the browser, and is kept as long as the run artifacts of this repository.'
    : 'After a push, GitHub Pages can take a minute to show the new page.';
  lines.push('', `<sub>${sha ? `For ${sha.slice(0, 7)}. ` : ''}${note}</sub>`);
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

// The address of the GitHub Pages site that serves `branch`, or null when there is none.
async function pagesSite(env, apiBase, repo, token, branch) {
  if (env.MIRROR_PAGES_URL) return env.MIRROR_PAGES_URL.replace(/\/*$/, '/');
  try {
    const site = await api('GET', `${apiBase}/repos/${repo}/pages`, token);
    if (site?.html_url && site.source?.branch === branch) return site.html_url.replace(/\/*$/, '/');
  } catch {
    // No Pages site: Pages is off, or the plan does not have it for a private repository.
  }
  return null;
}

// ---------------------------------------------------------------- main

function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

function context() {
  const env = process.env;
  const repo = env.GITHUB_REPOSITORY;
  const pr = env.MIRROR_PR;
  if (!pr || !repo) throw new Error('Run the action on a pull_request event.');
  const apiBase = env.GITHUB_API_URL || 'https://api.github.com';
  return {
    env, repo, pr, apiBase, cwd: process.cwd(), token: env.MIRROR_TOKEN,
    mirrorDir: (env.MIRROR_DIR || '.mirror').replace(/\/+$/, ''),
    branch: env.MIRROR_BRANCH || 'gh-pages',
    mode: env.MIRROR_PUBLISH || 'auto',
    issue: `${apiBase}/repos/${repo}/issues/${pr}`,
  };
}

// Step 1: find the review pages. Publish them to GitHub Pages when the repository has a
// Pages site. Else give the action the page to attach to the run.
async function prepare() {
  const c = context();
  if (c.env.MIRROR_ACTION === 'closed') {
    unpublish({ pr: c.pr, branch: c.branch, cwd: c.cwd });
    setOutput('mode', 'none');
    return;
  }
  if (!c.env.MIRROR_BASE) throw new Error('No base revision. Set the base input.');
  const head = c.env.MIRROR_HEAD || 'HEAD';
  const pages = reviewPages(c.env.MIRROR_BASE, head, c.mirrorDir, c.cwd);
  setOutput('pages', JSON.stringify(pages));

  const site = pages.length && c.mode !== 'artifact' ? await pagesSite(c.env, c.apiBase, c.repo, c.token, c.branch) : null;
  if (c.mode === 'pages' && pages.length && !site) {
    throw new Error(`No GitHub Pages site serves the branch ${c.branch}. Turn on Pages for it, or set publish to artifact.`);
  }
  if (site) {
    publish({ pages, pr: c.pr, head, branch: c.branch, cwd: c.cwd });
    const links = pages.map((p) => ({ name: basename(p, '.html'), url: `${site}pr-${c.pr}/${encodeURIComponent(basename(p))}` }));
    setOutput('mode', 'pages');
    setOutput('links', JSON.stringify(links));
    return;
  }
  // An older Pages copy of this pull request is out of date now.
  unpublish({ pr: c.pr, branch: c.branch, cwd: c.cwd });
  if (pages.length) {
    // The upload step attaches one file. The newest review page has the highest number.
    const page = [...pages].sort().at(-1);
    const dir = mkdtempSync(join(tmpdir(), 'mirror-artifact-'));
    writeFileSync(join(dir, basename(page)), execFileSync('git', ['show', `${head}:${page}`], { cwd: c.cwd, maxBuffer: 256 * 1024 * 1024 }));
    setOutput('mode', 'artifact');
    setOutput('file', join(dir, basename(page)));
    setOutput('links', JSON.stringify([{ name: basename(page, '.html'), page }]));
    return;
  }
  setOutput('mode', 'none');
  setOutput('links', '[]');
}

// Step 2: post or update the comment.
async function comment() {
  const c = context();
  if (c.env.MIRROR_ACTION === 'closed') return;
  let links = JSON.parse(c.env.MIRROR_LINKS || '[]');
  if (c.env.MIRROR_ARTIFACT_URL) links = links.map((l) => ({ ...l, url: c.env.MIRROR_ARTIFACT_URL }));
  links = links.filter((l) => l.url);
  const body = render({ links, sha: c.env.MIRROR_HEAD_SHA, artifact: Boolean(c.env.MIRROR_ARTIFACT_URL) });
  setOutput('url', links[0]?.url || '');
  if (c.env.GITHUB_STEP_SUMMARY) appendFileSync(c.env.GITHUB_STEP_SUMMARY, body.replace(MARKER + '\n', ''));
  const existing = await findComment(c.issue, c.token);
  if (existing) await api('PATCH', existing.url, c.token, { body });
  else if (links.length) await api('POST', `${c.issue}/comments`, c.token, { body });
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const command = { prepare, comment }[process.argv[2]];
  if (!command) {
    console.log('Usage: review-page.mjs prepare|comment');
    process.exit(2);
  }
  command().catch((err) => {
    // A pull request from a fork gets a read-only token: it cannot push or comment.
    // Warn, and do not fail the checks of the pull request.
    console.log(`::warning::Mirror could not publish the review page: ${err.message}`);
  });
}
