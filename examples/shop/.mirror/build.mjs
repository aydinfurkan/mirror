// Build the Mirror graph page from the mirror files.
//   node build.mjs <mirror dir> [--template <page.html>]            → <mirror dir>/visualize.html
//   node build.mjs <mirror dir> --review <NNNN-slug> [--template …]  → <mirror dir>/features/NNNN-slug.html
// The template defaults to <mirror dir>/visualize.html, else the visualize.html next to this file.
// It reads config.json, visualize.md and xsrc/**, finds the links, and writes one self-contained page.
// It prints each link error and writes nothing when there is one.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ---- Links ----

export const VERBS = ['calls', 'publishes', 'consumes', 'reads', 'writes'];
const LINK = /^\s*[-*]\s+(\w+)\s+`([^`]+)`\s*(?::\s*(.*?))?\s*$/;
const CALL = /^\s*[-*]\s+Call:\s*`([^`]+)`\s*(?::\s*(.*?))?\s*$/i;

// The links in the `## Dependencies` section of a boundary text. A bullet that starts with a
// verb and has a backtick but does not match the link form is `bad`. Other bullets are notes.
export function parseLinks(md) {
  const out = [];
  let on = false;
  for (const line of String(md || '').split(/\r?\n/)) {
    if (/^#{1,6}\s/.test(line)) { on = /^##\s+Dependencies\s*$/i.test(line); continue; }
    if (!on || !/^\s*[-*]\s/.test(line)) continue;
    const first = (/^\s*[-*]\s+(\w+)/.exec(line) || [])[1];
    if (!VERBS.includes(String(first).toLowerCase())) continue;
    const m = LINK.exec(line);
    if (m) out.push({ verb: m[1].toLowerCase(), to: m[2].trim(), note: m[3] || '' });
    else if (line.includes('`')) out.push({ bad: true, text: line.trim() });
  }
  return out;
}

// The `Call:` bullets of an actions text, as `calls` links. A bullet that starts like a call
// (`Calls:`, `Call` without a colon, `**Call:**`) but does not match the call form is `bad`.
export function parseCalls(md) {
  const out = [];
  for (const line of String(md || '').split(/\r?\n/)) {
    if (!/^\s*[-*]\s+\**calls?\b/i.test(line)) continue;
    const m = CALL.exec(line);
    out.push(m ? { verb: 'calls', to: m[1].trim(), note: m[2] || '' } : { bad: true, call: true, text: line.trim() });
  }
  return out;
}

// The links of a flow: the `Call:` lines of its actions when it has actions, else the
// Dependencies of its boundary. old: use the values before a review change. `old.actions: null`
// means the old flow had no actions.
export function flowLinks(f, old) {
  const o = old && f.old ? f.old : {};
  const actions = 'actions' in o ? o.actions : f.actions;
  const boundary = 'boundary' in o ? o.boundary : f.boundary;
  return typeof actions === 'string' ? parseCalls(actions) : parseLinks(boundary);
}

const extIds = (data) => new Set((data.external || []).map((x) => x.id));

// Each flow's outgoing links, and each target's incoming links. Keys: `p/f`, `p`, `ext:<id>`.
export function linkIndex(data) {
  const ext = extIds(data), out = {}, into = {};
  for (const p of data.projects || []) for (const f of p.flows || []) {
    const from = p.id + '/' + f.id;
    out[from] = flowLinks(f).filter((l) => !l.bad).map((l) => {
      const key = ext.has(l.to) ? 'ext:' + l.to : l.to;
      (into[key] = into[key] || []).push({ from, verb: l.verb, note: l.note });
      return { verb: l.verb, to: l.to, note: l.note, key };
    });
  }
  return { out, into };
}

// The lines of the System tab: one per project pair or project-external pair, counted by verb.
// A line only in the new links is `added`. A line only in the old links is `removed`.
export function systemEdges(data) {
  const ext = extIds(data), pids = new Set((data.projects || []).map((p) => p.id)), edges = [], by = {};
  function add(side, from, l) {
    if (l.bad) return;
    const to = ext.has(l.to) ? 'ext:' + l.to : l.to.split('/')[0];
    if (to === from || !(ext.has(l.to) || pids.has(to))) return;
    let e = by[from + '>' + to];
    if (!e) edges.push(e = by[from + '>' + to] = { from, to, old: {}, now: {} });
    e[side][l.verb] = (e[side][l.verb] || 0) + 1;
  }
  for (const p of data.projects || []) for (const f of p.flows || []) {
    if (f.status !== 'added') flowLinks(f, true).forEach((l) => add('old', p.id, l));
    if (f.status !== 'removed') flowLinks(f).forEach((l) => add('now', p.id, l));
  }
  return edges.map((e) => {
    const had = Object.keys(e.old).length > 0, has = Object.keys(e.now).length > 0, c = has ? e.now : e.old;
    return { from: e.from, to: e.to, status: had && has ? null : has ? 'added' : 'removed',
      label: VERBS.filter((v) => c[v]).map((v) => c[v] + ' ' + v).join(' · ') };
  });
}

// Problems in the links: an external with a project id, a bad bullet, an unknown target.
export function linkErrors(data) {
  const ids = new Set(), errs = [];
  for (const p of data.projects || []) {
    ids.add(p.id);
    for (const f of p.flows || []) if (f.status !== 'removed') ids.add(p.id + '/' + f.id);
  }
  for (const x of data.external || []) {
    if (ids.has(x.id)) errs.push('external `' + x.id + '` has the id of a project');
    else if (x.status !== 'removed') ids.add(x.id);
  }
  for (const p of data.projects || []) for (const f of p.flows || []) {
    if (f.status === 'removed') continue;
    const at = p.id + '/' + f.id + ': ';
    for (const l of flowLinks(f)) {
      if (l.bad && l.call) errs.push(at + 'write the call as "- Call: `<target>`: <note>": ' + l.text);
      else if (l.bad) errs.push(at + 'write the link as "- <verb> `<target>`: <note>": ' + l.text);
      else if (!ids.has(l.to)) errs.push(at + 'unknown target `' + l.to + '`');
    }
    if (typeof f.actions === 'string' && parseLinks(f.boundary).length) {
      errs.push(at + 'move the links of boundary.md to `Call:` lines in actions.md');
    }
  }
  return errs;
}

// Put the links into the data for the page: `out` and `into` on each flow, `into` on each
// external, and the System lines in `system.edges`.
export function addLinks(data) {
  const idx = linkIndex(data);
  for (const p of data.projects || []) for (const f of p.flows || []) {
    const key = p.id + '/' + f.id;
    f.out = idx.out[key] || [];
    f.into = idx.into[key] || [];
  }
  for (const x of data.external || []) x.into = idx.into['ext:' + x.id] || [];
  data.system = { edges: systemEdges(data) };
  return data;
}

// ---- Mirror files ----

const dot = (s) => (/[.!?]$/.test(s) ? s : s + '.');

// One entry per `## N. <step>` header (steps.md), or per `## <action>` header (actions.md).
export function parseSteps(md, actions) {
  const out = [];
  let cur = null;
  for (const line of String(md || '').split(/\r?\n/)) {
    const h = actions ? /^##\s+(.*)$/.exec(line) : /^##\s+(\d+)\.\s+(.*)$/.exec(line);
    if (h) {
      out.push(cur = { n: actions ? out.length + 1 : Number(h[1]), title: dot((actions ? h[1] : h[2]).trim()), text: '', details: [], ref: '', status: null });
      continue;
    }
    const b = cur && /^\s*[-*]\s+(.*)$/.exec(line);
    if (!b) continue;
    const code = /^Code:\s*`([^`]+)`/.exec(b[1]);
    if (code) cur.ref = code[1];
    else cur.details.push(dot(b[1].trim()));
  }
  for (const s of out) s.text = [s.title, ...s.details].join(' ');
  return out;
}

function frontmatter(md) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(md);
  const fm = {};
  if (m) for (const line of m[1].split(/\r?\n/)) {
    const kv = /^(\w+):\s*(.*)$/.exec(line);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return { fm, body: m ? m[2] : md };
}

const read = (p) => readFileSync(p, 'utf8');
const readIf = (p) => (existsSync(p) ? read(p) : '');

// The graph data of a mirror folder, without links and without review statuses.
export function readMirror(dir, today = new Date().toISOString().slice(0, 10)) {
  const cfg = JSON.parse(read(join(dir, 'config.json')));
  const data = { generated: today, title: basename(dirname(resolve(dir))), external: [], projects: [] };
  for (const [id, p] of Object.entries(cfg.projects || {})) {
    const pd = join(dir, 'xsrc', id);
    const project = { id, kind: p.kind, definition: readIf(join(pd, 'definition.md')), status: null, flows: [] };
    const folders = existsSync(pd) ? readdirSync(pd).filter((n) => statSync(join(pd, n)).isDirectory()).sort() : [];
    for (const fid of folders) {
      const fd = join(pd, fid);
      const { fm, body } = frontmatter(readIf(join(fd, 'definition.md')));
      const flow = { id: fid, kind: fm.trigger === 'page' ? 'page' : 'flow', trigger: fm.trigger || '', entry: fm.entry || '',
        group: fm.group || '', definition: body, boundary: readIf(join(fd, 'boundary.md')), rules: readIf(join(fd, 'rules.md')), status: null };
      if (existsSync(join(fd, 'actions.md'))) { flow.actions = read(join(fd, 'actions.md')); flow.steps = parseSteps(flow.actions, true); }
      else flow.steps = parseSteps(readIf(join(fd, 'steps.md')), false);
      project.flows.push(flow);
    }
    data.projects.push(project);
  }
  data.external = Object.entries(cfg.external || {}).map(([id, x]) => ({ id, kind: x.kind || '', name: x.name || '', status: null }));
  return data;
}

// ---- Review ----

const FLOW_FIELDS = ['trigger', 'entry', 'group', 'definition', 'boundary', 'rules', 'actions'];

// Set a status on an item and on each flow and step in it.
function mark(item, status) {
  item.status = status;
  for (const f of item.flows || []) mark(f, status);
  for (const s of item.steps || []) s.status = status;
  return item;
}

// Merge old and new lists: items only in the new list are `added`; items only in the old list
// go back at their old position as `removed`. same(a, b) matches an old item with a new one.
function mergeList(oldList, newList, same, onBoth) {
  const out = newList.map((n) => {
    const o = oldList.find((x) => same(x, n));
    if (!o) mark(n, 'added');
    else if (onBoth) onBoth(o, n);
    return n;
  });
  oldList.forEach((o, i) => {
    if (newList.some((n) => same(o, n))) return;
    out.splice(Math.min(i, out.length), 0, mark(structuredClone(o), 'removed'));
  });
  return out;
}

// The review data: the new data with a status on each project, flow, step and external that
// differs from the old data, and `old` values on each changed project and flow.
export function reviewData(oldData, newData) {
  const data = structuredClone(newData);
  data.external = mergeList(oldData.external || [], data.external || [], (a, b) => a.id === b.id);
  data.projects = mergeList(oldData.projects || [], data.projects || [], (a, b) => a.id === b.id, (op, np) => {
    np.flows = mergeList(op.flows || [], np.flows || [], (a, b) => a.id === b.id, (of, nf) => {
      nf.steps = mergeList(of.steps || [], nf.steps || [], (a, b) => a.ref === b.ref && a.text === b.text);
      const old = {};
      for (const k of FLOW_FIELDS) if ((of[k] ?? null) !== (nf[k] ?? null)) old[k] = of[k] ?? null;
      if (Object.keys(old).length || nf.steps.some((s) => s.status)) { nf.status = 'changed'; if (Object.keys(old).length) nf.old = old; }
    });
    const changed = op.definition !== np.definition;
    if (changed || np.flows.some((f) => f.status)) np.status = 'changed';
    if (changed) np.old = { definition: op.definition };
  });
  return data;
}

// ---- Page ----

const DATA = /(<script type="application\/json" id="mirror-data">)([\s\S]*?)(<\/script>)/;

export const pageData = (html) => JSON.parse(html.match(DATA)[2]);

// The template with the tokens of visualize.md and the data in it.
export function writePage(template, tokensMd, data) {
  const tokens = (tokensMd.match(/```css\r?\n([\s\S]*?)```/) || [])[1];
  let out = template;
  if (tokens) out = out.replace(/(\/\* MIRROR:TOKENS:START \*\/\r?\n)[\s\S]*?(\/\* MIRROR:TOKENS:END \*\/)/, (_, a, b) => a + tokens + b);
  return out.replace(DATA, (_, a, _old, b) => a + '\n' + JSON.stringify(data).replace(/</g, '\\u003c') + '\n' + b);
}

function arg(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}

export function main(argv = process.argv.slice(2)) {
  const dir = argv[0];
  if (!dir || dir.startsWith('--')) {
    console.error('usage: node build.mjs <mirror dir> [--review <NNNN-slug>] [--template <page.html>]');
    return 2;
  }
  const current = join(dir, 'visualize.html');
  const templatePath = arg(argv, '--template') || (existsSync(current) ? current : fileURLToPath(new URL('./visualize.html', import.meta.url)));
  const slug = arg(argv, '--review');
  let data = readMirror(dir);
  if (slug) data = reviewData(existsSync(current) ? pageData(read(current)) : { projects: [], external: [] }, data);
  const errs = linkErrors(data);
  if (errs.length) {
    for (const e of errs) console.error(e);
    console.error(errs.length + ' link error(s). Nothing written.');
    return 1;
  }
  addLinks(data);
  const target = slug ? join(dir, 'features', slug + '.html') : current;
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, writePage(read(templatePath), readIf(join(dir, 'visualize.md')), data));
  console.log(target + ': ' + data.projects.map((p) => p.id + ' ' + p.flows.length).join(', ') + ', ' + data.external.length + ' external');
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exitCode = main();
