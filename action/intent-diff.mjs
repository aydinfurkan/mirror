#!/usr/bin/env node
// Mirror intent diff: compare the .mirror/xsrc/ data of two git revisions and post the
// added, changed and removed projects, flows and pages as one pull request comment.
// No dependencies: Node 20 and git only.

import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const MARKER = '<!-- mirror-intent-diff -->';
const MAX_BODY = 60000;

const FLOW_FIELDS = ['trigger', 'entry', 'group', 'definition', 'boundary', 'rules', 'steps'];
const PAGE_FIELDS = ['trigger', 'entry', 'group', 'definition', 'design', 'rules', 'actions'];
const FIELD_LABELS = {
  trigger: 'trigger', entry: 'entry', group: 'group', definition: 'definition',
  boundary: 'boundary', design: 'design', rules: 'business rules', actions: 'actions', steps: 'steps',
};
const ICONS = { added: '🟢', changed: '🟡', removed: '🔴' };

// ---------------------------------------------------------------- git

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

// Every file under `dir` at `ref`, as a Map of dir-relative path to text.
export function readTree(ref, dir, cwd) {
  const prefix = dir.replace(/\/+$/, '') + '/';
  const paths = git(['ls-tree', '-r', '-z', '--name-only', ref, '--', prefix], cwd)
    .split('\0').filter(Boolean);
  const files = new Map();
  if (!paths.length) return files;
  const out = execFileSync('git', ['cat-file', '--batch'], {
    cwd, input: paths.map((p) => `${ref}:${p}`).join('\n') + '\n', maxBuffer: 256 * 1024 * 1024,
  });
  let pos = 0;
  for (const path of paths) {
    const eol = out.indexOf(0x0a, pos);
    const header = out.subarray(pos, eol).toString();
    const size = Number(header.split(' ')[2]);
    files.set(path.slice(prefix.length), out.subarray(eol + 1, eol + 1 + size).toString('utf8'));
    pos = eol + 1 + size + 1;
  }
  return files;
}

// The unified diff of each changed file under `dir`, keyed by dir-relative path.
export function fileDiffs(base, head, dir, cwd) {
  const prefix = dir.replace(/\/+$/, '') + '/';
  const text = git(['diff', '--no-color', '--no-renames', '-U3', base, head, '--', prefix], cwd);
  const diffs = new Map();
  for (const chunk of text.split(/^(?=diff --git )/m).filter(Boolean)) {
    const m = chunk.match(/^diff --git a\/(.+?) b\/\1$/m) || chunk.match(/^diff --git a\/(.+?) b\//m);
    if (!m) continue;
    const body = chunk.slice(chunk.search(/^@@/m));
    diffs.set(m[1].slice(prefix.length), chunk.search(/^@@/m) === -1 ? '' : body);
  }
  return diffs;
}

export function changedPaths(base, head, dir, cwd) {
  const prefix = dir.replace(/\/+$/, '') + '/';
  return git(['diff', '--name-status', '--no-renames', base, head, '--', prefix], cwd)
    .split('\n').filter(Boolean)
    .map((line) => { const [status, path] = line.split('\t'); return { status, path }; });
}

// ---------------------------------------------------------------- data (build-data.md)

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: text.slice(m[0].length) };
}

function sentence(s) {
  s = s.trim();
  return /[.!?:]$/.test(s) ? s : s + '.';
}

function parseSteps(text, numbered) {
  const steps = [];
  let cur = null;
  for (const line of (text || '').split(/\r?\n/)) {
    const h = line.match(/^##\s+(.*)$/);
    if (h) {
      let title = h[1].trim();
      let n = steps.length + 1;
      const num = numbered && title.match(/^(\d+)\.\s*(.*)$/);
      if (num) { n = Number(num[1]); title = num[2]; }
      cur = { n, title: sentence(title), details: [] };
      steps.push(cur);
      continue;
    }
    const b = line.match(/^\s*[-*]\s+(.*)$/);
    if (cur && b) cur.details.push(sentence(b[1]));
  }
  for (const s of steps) s.text = [s.title, ...s.details].join(' ');
  return steps;
}

// Make the viewer data from the files of .mirror/xsrc/, as the mirror:build skill does.
export function buildData(files) {
  let config = {};
  try { config = JSON.parse(files.get('config.json') || '{}'); } catch { config = {}; }
  const projectIds = Object.keys(config.projects || {});
  // A project folder with no entry in config.json still counts.
  for (const path of files.keys()) {
    const top = path.split('/')[0];
    if (path.includes('/') && !projectIds.includes(top)) projectIds.push(top);
  }
  const projects = projectIds.map((id) => {
    const flowIds = [...new Set([...files.keys()]
      .filter((p) => p.startsWith(id + '/') && p.split('/').length === 3)
      .map((p) => p.split('/')[1]))].sort();
    const flows = flowIds.map((fid) => {
      const read = (name) => files.get(`${id}/${fid}/${name}`) ?? '';
      const { meta, body } = frontmatter(read('definition.md'));
      const kind = (meta.trigger || '') === 'page' ? 'page' : 'flow';
      const flow = {
        id: fid, kind, trigger: meta.trigger || '', entry: meta.entry || '', group: meta.group || '',
        definition: body.trim(), rules: read('business-rules.md'),
      };
      if (kind === 'page') {
        flow.design = read('design.md');
        flow.actions = read('actions.md');
        flow.steps = parseSteps(flow.actions, false);
      } else {
        flow.boundary = read('boundary.md');
        flow.steps = parseSteps(read('steps.md'), true);
      }
      return flow;
    });
    return {
      id, kind: config.projects?.[id]?.kind || '', definition: files.get(`${id}/definition.md`) ?? '', flows,
    };
  });
  return { projects, external: config.external || {} };
}

// ---------------------------------------------------------------- compare (review-page.md)

export function compare(oldData, newData) {
  const result = { projects: [], external: [] };
  const oldProjects = new Map(oldData.projects.map((p) => [p.id, p]));
  const newIds = new Set(newData.projects.map((p) => p.id));

  const flowEntry = (project, flow, status, old) => {
    const fields = flow.kind === 'page' ? PAGE_FIELDS : FLOW_FIELDS;
    const entry = { project, id: flow.id, kind: flow.kind, entry: flow.entry, definition: flow.definition, status, changes: [], steps: { added: [], removed: [] }, flow };
    if (status === 'added') entry.steps.added = flow.steps;
    if (status === 'removed') entry.steps.removed = flow.steps;
    if (status === 'changed') {
      for (const f of fields) {
        if (f === 'steps') continue;
        if ((old[f] ?? '') !== (flow[f] ?? '')) entry.changes.push(f);
      }
      const oldTexts = new Set(old.steps.map((s) => s.text));
      const newTexts = new Set(flow.steps.map((s) => s.text));
      entry.steps.added = flow.steps.filter((s) => !oldTexts.has(s.text));
      entry.steps.removed = old.steps.filter((s) => !newTexts.has(s.text));
      const reordered = !entry.steps.added.length && !entry.steps.removed.length
        && old.steps.map((s) => s.text).join('\n') !== flow.steps.map((s) => s.text).join('\n');
      if ((entry.steps.added.length || entry.steps.removed.length || reordered) && flow.kind === 'flow') entry.changes.push('steps');
      if (old.kind !== flow.kind) entry.changes.unshift('trigger');
      entry.changes = [...new Set(entry.changes)];
      if (!entry.changes.length) return null;
    }
    return entry;
  };

  const handle = (project, status, old) => {
    const p = { id: project.id, kind: project.kind, status, flows: [] };
    const oldFlows = new Map((old?.flows || []).map((f) => [f.id, f]));
    const newFlowIds = new Set(project.flows.map((f) => f.id));
    if (status === 'removed') {
      for (const f of project.flows) p.flows.push(flowEntry(project.id, f, 'removed'));
    } else {
      for (const f of project.flows) {
        const o = oldFlows.get(f.id);
        const e = o ? flowEntry(project.id, f, 'changed', o) : flowEntry(project.id, f, 'added');
        if (e) p.flows.push(e);
      }
      for (const f of old?.flows || []) {
        if (!newFlowIds.has(f.id)) p.flows.push(flowEntry(project.id, f, 'removed'));
      }
    }
    if (status === null && old.definition !== project.definition) p.status = 'changed';
    if (p.status || p.flows.length) result.projects.push(p);
  };

  for (const project of newData.projects) {
    const old = oldProjects.get(project.id);
    handle(project, old ? null : 'added', old);
  }
  for (const project of oldData.projects) {
    if (!newIds.has(project.id)) handle(project, 'removed');
  }

  const oldExt = oldData.external || {};
  const newExt = newData.external || {};
  for (const id of Object.keys(newExt)) {
    if (!(id in oldExt)) result.external.push({ id, status: 'added', ...newExt[id] });
    else if (JSON.stringify(oldExt[id]) !== JSON.stringify(newExt[id])) result.external.push({ id, status: 'changed', ...newExt[id] });
  }
  for (const id of Object.keys(oldExt)) {
    if (!(id in newExt)) result.external.push({ id, status: 'removed', ...oldExt[id] });
  }
  return result;
}

// ---------------------------------------------------------------- markdown

const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const code = (s) => (s ? '`' + String(s).replace(/`/g, "'") + '`' : '');
const quote = (s) => s.trim().split(/\r?\n/).map((l) => '> ' + l).join('\n');

function count(n, one, many) { return `${n} ${n === 1 ? one : many}`; }

function whatChanged(e) {
  if (e.status === 'added') return `new ${e.kind}`;
  if (e.status === 'removed') return `${e.kind} removed`;
  const parts = e.changes.filter((c) => c !== 'steps' && c !== 'actions').map((c) => FIELD_LABELS[c]);
  const name = e.kind === 'page' ? 'actions' : 'steps';
  const plusMinus = e.steps.added.length || e.steps.removed.length ? ` (+${e.steps.added.length} −${e.steps.removed.length})` : '';
  if (e.changes.includes('steps') || e.changes.includes('actions')) parts.push(name + plusMinus);
  return parts.join(', ');
}

function stepLine(s, mark) {
  const details = s.details.length ? ` <sub>${s.details.map(cell).join(' ')}</sub>` : '';
  return `- ${mark} ${s.title}${details}`;
}

function details(name, diff) {
  // Four backticks, so that a code block inside a mirror file does not end the fence.
  return [`<details><summary>${name}</summary>`, '', '````diff', diff.trimEnd(), '````', '', '</details>', ''];
}

export function render(diff, opts = {}) {
  const { fileDiffs = new Map(), reviewPages = [], blobUrl = null, withFileDiffs = true } = opts;
  const lines = [MARKER, '## 🪞 Mirror intent diff', ''];
  const flows = diff.projects.flatMap((p) => p.flows);
  const projectChanges = diff.projects.filter((p) => p.status);

  if (!flows.length && !projectChanges.length && !diff.external.length) {
    lines.push('This pull request does not change the intent in `.mirror/xsrc/`.');
    return lines.join('\n') + '\n';
  }

  const by = (status) => flows.filter((f) => f.status === status).length;
  const nFlows = flows.filter((f) => f.kind === 'flow').length;
  const nPages = flows.filter((f) => f.kind === 'page').length;
  const subject = [nFlows && count(nFlows, 'flow', 'flows'), nPages && count(nPages, 'page', 'pages')].filter(Boolean).join(' and ');
  const tally = ['added', 'changed', 'removed'].filter(by).map((s) => `${by(s)} ${s}`).join(', ');
  lines.push(subject
    ? `This pull request changes the intent of **${subject}**: ${tally}. Review the intent first, then the code.`
    : 'This pull request changes the intent of the projects below. Review the intent first, then the code.');
  lines.push('');

  for (const page of reviewPages) {
    const link = blobUrl ? `[${code(page)}](${blobUrl(page)})` : code(page);
    lines.push(`Review page: ${link}. Download it and open it in a browser to see the mirror of this change.`);
  }
  if (reviewPages.length) lines.push('');

  if (projectChanges.length || diff.external.length) {
    lines.push('| | Project or system | Kind | What changed |', '|---|---|---|---|');
    for (const p of projectChanges) {
      const what = p.status === 'changed' ? 'definition' : `project ${p.status}`;
      lines.push(`| ${ICONS[p.status]} ${p.status} | ${code(p.id)} | ${cell(p.kind)} | ${what} |`);
    }
    for (const x of diff.external) {
      lines.push(`| ${ICONS[x.status]} ${x.status} | ${code(x.id)} | external ${cell(x.kind)} | ${cell(x.name)} |`);
    }
    lines.push('');
  }

  if (flows.length) {
    lines.push('| | Project | Flow or page | Entry | What changed |', '|---|---|---|---|---|');
    for (const f of flows) {
      lines.push(`| ${ICONS[f.status]} ${f.status} | ${code(f.project)} | ${code(f.id)} | ${code(f.entry)} | ${whatChanged(f)} |`);
    }
    lines.push('');
  }

  for (const f of flows) {
    lines.push(`### ${ICONS[f.status]} ${code(f.project + '/' + f.id)} · ${f.kind} ${f.status}`, '');
    if (f.definition) lines.push(quote(f.definition), '');
    const changedFields = f.changes.filter((c) => c !== 'steps' && c !== 'actions');
    if (changedFields.length) lines.push(`Changed: ${changedFields.map((c) => FIELD_LABELS[c]).join(', ')}.`, '');
    const stepName = f.kind === 'page' ? 'Actions' : 'Steps';
    if (f.status === 'added' || f.status === 'removed') {
      if (f.flow.steps.length) {
        lines.push(`${stepName}:`, '');
        for (const s of f.flow.steps) lines.push(stepLine(s, f.status === 'added' ? '➕' : '➖'));
        lines.push('');
      }
    } else if (f.steps.added.length || f.steps.removed.length) {
      lines.push(`${stepName}:`, '');
      for (const s of f.steps.removed) lines.push(stepLine(s, '➖'));
      for (const s of f.steps.added) lines.push(stepLine(s, '➕'));
      lines.push('');
    } else if (f.changes.includes('steps') || f.changes.includes('actions')) {
      lines.push(`${stepName}: the same ${stepName.toLowerCase()} in a new order, or new text outside them.`, '');
    }

    if (withFileDiffs && f.status === 'changed') {
      const prefix = `${f.project}/${f.id}/`;
      for (const [path, d] of fileDiffs) {
        if (!path.startsWith(prefix) || !d) continue;
        lines.push(...details(path.slice(prefix.length), d));
      }
    }
  }

  for (const p of projectChanges.filter((p) => p.status === 'changed')) {
    lines.push(`### ${ICONS.changed} ${code(p.id)} · project changed`, '');
    const d = fileDiffs.get(`${p.id}/definition.md`);
    if (withFileDiffs && d) lines.push(...details('definition.md', d));
  }
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

async function findComment(base, token) {
  for (let page = 1; ; page++) {
    const comments = await api('GET', `${base}/comments?per_page=100&page=${page}`, token);
    const found = comments.find((c) => c.body?.startsWith(MARKER));
    if (found) return found;
    if (comments.length < 100) return null;
  }
}

// ---------------------------------------------------------------- main

function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

export function makeBody(base, head, mirrorDir, cwd, blobUrl) {
  const xsrc = `${mirrorDir}/xsrc`;
  const diff = compare(buildData(readTree(base, xsrc, cwd)), buildData(readTree(head, xsrc, cwd)));
  const reviewPages = changedPaths(base, head, `${mirrorDir}/features`, cwd)
    .filter((c) => c.status !== 'D' && c.path.endsWith('.html')).map((c) => c.path);
  const opts = { fileDiffs: fileDiffs(base, head, xsrc, cwd), reviewPages, blobUrl };
  let body = render(diff, opts);
  if (body.length > MAX_BODY) body = render(diff, { ...opts, withFileDiffs: false });
  if (body.length > MAX_BODY) body = body.slice(0, MAX_BODY) + '\n\n_The diff is too long. It is cut here._\n';
  const changed = diff.projects.length > 0 || diff.external.length > 0;
  return { body, changed };
}

async function main() {
  const env = process.env;
  const mirrorDir = (env.MIRROR_DIR || '.mirror').replace(/\/+$/, '');
  const base = env.MIRROR_BASE;
  const head = env.MIRROR_HEAD || 'HEAD';
  if (!base) throw new Error('No base revision. Run the action on a pull_request event, or set the base input.');

  let resolvedBase = base;
  try {
    resolvedBase = git(['merge-base', base, head]).trim();
  } catch {
    // A shallow clone: the base itself is close enough on the merge commit of a pull request.
  }

  const repo = env.GITHUB_REPOSITORY;
  const server = env.GITHUB_SERVER_URL || 'https://github.com';
  const blobSha = env.MIRROR_HEAD_SHA || head;
  const blobUrl = repo ? (p) => `${server}/${repo}/blob/${blobSha}/${p.split('/').map(encodeURIComponent).join('/')}` : null;

  const { body, changed } = makeBody(resolvedBase, head, mirrorDir, process.cwd(), blobUrl);
  setOutput('changed', String(changed));
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, body.replace(MARKER + '\n', ''));
  if (!env.GITHUB_ACTIONS) process.stdout.write(body);

  const pr = env.MIRROR_PR;
  if (env.MIRROR_COMMENT === 'false' || !pr || !repo) return;
  const token = env.MIRROR_TOKEN;
  const issue = `${env.GITHUB_API_URL || 'https://api.github.com'}/repos/${repo}/issues/${pr}`;
  try {
    const existing = await findComment(issue, token);
    if (existing) await api('PATCH', existing.url, token, { body });
    else if (changed) await api('POST', `${issue}/comments`, token, { body });
  } catch (err) {
    // A pull request from a fork gets a read-only token. Keep the job summary, do not fail.
    console.log(`::warning::Mirror could not post the comment: ${err.message}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main().catch((err) => { console.log(`::error::${err.message}`); process.exit(1); });
}
