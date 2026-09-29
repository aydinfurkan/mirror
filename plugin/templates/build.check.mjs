// Usage: node build.check.mjs  (tests build.mjs next to this file)
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
import { parseLinks, parseCalls, flowLinks, linkIndex, systemEdges, linkErrors, addLinks, parseSteps, readMirror, reviewData, writePage, pageData, main } from './build.mjs';

const plain = (x) => JSON.parse(JSON.stringify(x));
// Links: only bullets under `## Dependencies` with a known verb and a backtick target. Windows line ends work.
const deps = '## Output\n- calls `x/y`\n\n## Dependencies\r\n- calls `api/create-post`: sends the form.\r\n' +
  '- Writes `posts-db`\n- `now()` from `src/x.ts`.\n- Topic `a.b`.\n- sends `api/a`\n- reads `posts-db` (in memory).\n## Notes\n- calls `api/b`';
assert.deepEqual(plain(parseLinks(deps)), [
  { verb: 'calls', to: 'api/create-post', note: 'sends the form.' },
  { verb: 'writes', to: 'posts-db', note: '' },
  { bad: true, text: '- reads `posts-db` (in memory).' },
]);
assert.deepEqual(plain(parseLinks(undefined)), []);

const sys = {
  external: [{ id: 'posts-db', kind: 'database', name: 'Postgres' }],
  projects: [
    { id: 'api', kind: 'backend', flows: [
      { id: 'create', boundary: '## Dependencies\n- writes `posts-db`\n- calls `api/other`', steps: [] },
      { id: 'other', boundary: '', steps: [] },
    ] },
    { id: 'web', kind: 'frontend', flows: [
      { id: 'new', boundary: '## Dependencies\n- calls `api/create`: posts.\n- calls `api/create`', steps: [] },
      { id: 'list', boundary: '## Dependencies\n- calls `api`\n- reads `posts-db`', steps: [] },
    ] },
  ],
};

// Outgoing links per flow; incoming links per target key.
const idx = linkIndex(sys);
assert.deepEqual(plain(idx.out['web/new']), [
  { verb: 'calls', to: 'api/create', note: 'posts.', key: 'api/create' },
  { verb: 'calls', to: 'api/create', note: '', key: 'api/create' },
]);
assert.deepEqual(plain(idx.out['api/other']), []);
assert.deepEqual(plain(idx.into['api/create']).map((l) => l.from), ['web/new', 'web/new']);
assert.deepEqual(plain(idx.into['api/other']), [{ from: 'api/create', verb: 'calls', note: '' }]);
assert.deepEqual(plain(idx.into['ext:posts-db']).map((l) => l.from), ['api/create', 'web/list']);
assert.deepEqual(plain(idx.into.api), [{ from: 'web/list', verb: 'calls', note: '' }]);

// System lines: counted by verb; a link inside one project draws no line.
assert.deepEqual(plain(systemEdges(sys)), [
  { from: 'api', to: 'ext:posts-db', status: null, label: '1 writes' },
  { from: 'web', to: 'api', status: null, label: '3 calls' },
  { from: 'web', to: 'ext:posts-db', status: null, label: '1 reads' },
]);
assert.equal(linkErrors(sys).length, 0);

// Data built before links existed still works.
assert.deepEqual(plain(systemEdges({ projects: [{ id: 'a', flows: [{ id: 'f', steps: [] }] }] })), []);
assert.deepEqual(plain(linkIndex({})), { out: {}, into: {} });
assert.equal(linkErrors({}).length, 0);

// Errors: an external with a project id, an unknown target, a bad bullet, a link to a removed flow.
// Links of a removed flow are not checked.
const bad = { external: [{ id: 'api' }, { id: 'q' }], projects: [
  { id: 'api', flows: [
    { id: 'f', boundary: '## Dependencies\n- calls `api/nope`\n- reads `q` (x).' },
    { id: 'gone', status: 'removed', boundary: '## Dependencies\n- calls `api/nope`' },
  ] },
  { id: 'web', flows: [{ id: 'p', boundary: '## Dependencies\n- calls `api/gone`' }] },
] };
assert.deepEqual(Array.from(linkErrors(bad)), [
  'external `api` has the id of a project',
  'api/f: unknown target `api/nope`',
  'api/f: write the link as "- <verb> `<target>`: <note>": - reads `q` (x).',
  'web/p: unknown target `api/gone`',
]);

// Review: a line only in the new links is added, only in the old links is removed (with its old label).
const rev = { external: [{ id: 'db' }], projects: [
  { id: 'api', status: 'changed', flows: [
    { id: 'a', status: 'changed', boundary: '## Dependencies\n- writes `db`', old: { boundary: '## Dependencies\n- calls `web`' } },
  ] },
  { id: 'web', status: 'changed', flows: [
    { id: 'n', status: 'added', boundary: '## Dependencies\n- calls `api`' },
    { id: 'm', boundary: '## Dependencies\n- reads `db`' },
  ] },
] };
assert.deepEqual(plain(systemEdges(rev)), [
  { from: 'api', to: 'web', status: 'removed', label: '1 calls' },
  { from: 'api', to: 'ext:db', status: 'added', label: '1 writes' },
  { from: 'web', to: 'api', status: 'added', label: '1 calls' },
  { from: 'web', to: 'ext:db', status: null, label: '1 reads' },
]);

// Review: an external removed from config.json stays in the data as `removed`. Its old lines are
// drawn as removed, and a live link to it is an error.
const gone = { external: [{ id: 'cache', kind: 'cache', status: 'removed' }], projects: [
  { id: 'api', status: 'changed', flows: [
    { id: 'a', status: 'changed', boundary: '## Dependencies\n', old: { boundary: '## Dependencies\n- writes `cache`' } },
  ] },
] };
assert.deepEqual(plain(systemEdges(gone)), [{ from: 'api', to: 'ext:cache', status: 'removed', label: '1 writes' }]);
assert.equal(linkErrors(gone).length, 0);
gone.projects[0].flows[0].boundary = '## Dependencies\n- reads `cache`';
assert.deepEqual(Array.from(linkErrors(gone)), ['api/a: unknown target `cache`']);

// Actions: each `Call:` bullet is a `calls` link. Other bullets are not links. A broken Call is bad.
const acts = '## Open the page\r\n- Call: `api/get`: load it.\r\n- Then: show it.\n- Fail: show an alert.\n- Code: `src/p.tsx#P`\n\n' +
  '## Click "Pay"\n- call: `stripe`\n- Call: api/x\n- Then: open `/done`.\n- Code: `src/p.tsx#pay`';
assert.deepEqual(plain(parseCalls(acts)), [
  { verb: 'calls', to: 'api/get', note: 'load it.' },
  { verb: 'calls', to: 'stripe', note: '' },
  { bad: true, call: true, text: '- Call: api/x' },
]);
assert.deepEqual(plain(parseCalls(undefined)), []);
// Near-miss call bullets are bad, not skipped.
assert.deepEqual(plain(parseCalls('- Calls: `api/x`\n- Call `api/x`\n- **Call:** `api/x`\n- calls `api/x`\n- Then: call the user.')), [
  { bad: true, call: true, text: '- Calls: `api/x`' },
  { bad: true, call: true, text: '- Call `api/x`' },
  { bad: true, call: true, text: '- **Call:** `api/x`' },
  { bad: true, call: true, text: '- calls `api/x`' },
]);

// A flow with `actions` takes its links from the actions; else from the boundary.
const pg = { id: 'p', kind: 'page', actions: '## Open\n- Call: `api/get`\n- Code: `a#b`', boundary: '' };
assert.deepEqual(plain(flowLinks(pg)), [{ verb: 'calls', to: 'api/get', note: '' }]);
assert.deepEqual(plain(flowLinks({ boundary: '## Dependencies\n- calls `api/get`' })), [{ verb: 'calls', to: 'api/get', note: '' }]);
// Old values: `old.actions` when present; `old.actions: null` means the old page had no actions.
assert.deepEqual(plain(flowLinks({ actions: '', old: { actions: '## A\n- Call: `api`\n- Code: `a#b`' } }, true)), [{ verb: 'calls', to: 'api', note: '' }]);
assert.deepEqual(plain(flowLinks({ actions: '## A\n- Call: `api`\n- Code: `a#b`', boundary: '',
  old: { actions: null, boundary: '## Dependencies\n- calls `api`' } }, true)), [{ verb: 'calls', to: 'api', note: '' }]);

const pages = { external: [{ id: 'stripe', kind: 'api' }], projects: [
  { id: 'api', flows: [{ id: 'get', boundary: '' }] },
  { id: 'web', flows: [
    { id: 'shop', kind: 'page', actions: '## Open\n- Call: `api/get`\n- Code: `a#b`\n## Click "Pay"\n- Call: `stripe`: pay.\n- Code: `a#c`', boundary: '' },
    { id: 'old', kind: 'page', boundary: '## Dependencies\n- calls `api/get`', steps: [] },
  ] },
] };
const pidx = linkIndex(pages);
assert.deepEqual(plain(pidx.out['web/shop']).map((l) => l.key), ['api/get', 'ext:stripe']);
assert.deepEqual(plain(pidx.into['api/get']).map((l) => l.from), ['web/shop', 'web/old']);
assert.deepEqual(plain(systemEdges(pages)), [
  { from: 'web', to: 'api', status: null, label: '2 calls' },
  { from: 'web', to: 'ext:stripe', status: null, label: '1 calls' },
]);
assert.equal(linkErrors(pages).length, 0);

// A page that moves from steps.md to actions.md in a review keeps its line (no added/removed flip).
const moved = { projects: [{ id: 'api', flows: [{ id: 'get', boundary: '' }] }, { id: 'web', status: 'changed', flows: [
  { id: 'p', kind: 'page', status: 'changed', actions: '## Open\n- Call: `api/get`\n- Code: `a#b`', boundary: '',
    old: { actions: null, boundary: '## Dependencies\n- calls `api/get`' } },
] }] };
assert.deepEqual(plain(systemEdges(moved)), [{ from: 'web', to: 'api', status: null, label: '1 calls' }]);

// A Call removed in a review draws a removed line.
const dropped = { external: [{ id: 'stripe' }], projects: [{ id: 'web', status: 'changed', flows: [
  { id: 'p', kind: 'page', status: 'changed', actions: '## Open\n- Code: `a#b`', old: { actions: '## Open\n- Call: `stripe`\n- Code: `a#b`' } },
] }] };
assert.deepEqual(plain(systemEdges(dropped)), [{ from: 'web', to: 'ext:stripe', status: 'removed', label: '1 calls' }]);

// Errors: a broken Call, an unknown Call target, boundary links on a page with actions.
const perr = { projects: [{ id: 'api', flows: [] }, { id: 'web', flows: [
  { id: 'a', kind: 'page', actions: '## Open\n- Call: api/x\n- Call: `api/nope`\n- Code: `a#b`', boundary: '## Dependencies\n- calls `api`' },
] }] };
assert.deepEqual(Array.from(linkErrors(perr)), [
  'web/a: write the call as "- Call: `<target>`: <note>": - Call: api/x',
  'web/a: unknown target `api/nope`',
  'web/a: move the links of boundary.md to `Call:` lines in actions.md',
]);

// addLinks puts the links into the data: out/into on flows, into on externals, system.edges.
const withLinks = addLinks(structuredClone(sys));
assert.deepEqual(withLinks.projects[1].flows[0].out.map((l) => l.key), ['api/create', 'api/create']);
assert.deepEqual(withLinks.projects[0].flows[0].into.map((l) => l.from), ['web/new', 'web/new']);
assert.deepEqual(withLinks.external[0].into.map((l) => l.from), ['api/create', 'web/list']);
assert.equal(withLinks.system.edges.length, 3);
assert.deepEqual(plain(addLinks({ projects: [] })), { projects: [], system: { edges: [] } });

// Steps: `## N. <step>` with details and the Code ref. Actions: `## <action>`, numbered from 1.
assert.deepEqual(plain(parseSteps('## 1. Validate the body\n- Return 400\n- Code: `a.ts#v`\n\n## 2. Save.\n- Code: `b.ts#s`', false)), [
  { n: 1, title: 'Validate the body.', text: 'Validate the body. Return 400.', details: ['Return 400.'], ref: 'a.ts#v', status: null },
  { n: 2, title: 'Save.', text: 'Save.', details: [], ref: 'b.ts#s', status: null },
]);
assert.deepEqual(plain(parseSteps('## Open the page\r\n- Call: `api/x`: load.\r\n- Then: show it\r\n- Code: `p.tsx#P`', true)), [
  { n: 1, title: 'Open the page.', text: 'Open the page. Call: `api/x`: load. Then: show it.', details: ['Call: `api/x`: load.', 'Then: show it.'], ref: 'p.tsx#P', status: null },
]);

// readMirror: a folder of mirror files becomes the graph data.
const tmp = mkdtempSync(join(tmpdir(), 'mirror-'));
const mir = join(tmp, 'repo', '.mirror');
const put = (p, s) => { mkdirSync(join(mir, p, '..'), { recursive: true }); writeFileSync(join(mir, p), s); };
put('config.json', JSON.stringify({ projects: { api: { root: 'api', kind: 'backend' }, web: { root: 'web', kind: 'frontend' } },
  external: { db: { kind: 'database', name: 'Postgres' } } }));
put('visualize.md', '```css\n:root { --x: 1; }\n```');
put('xsrc/api/definition.md', 'The api.');
put('xsrc/api/get/definition.md', '---\ntrigger: http\nentry: GET /x\n---\nGet x.\n');
put('xsrc/api/get/steps.md', '## 1. Read x\n- Code: `a#b`');
put('xsrc/api/get/boundary.md', '## Dependencies\n- reads `db`');
put('xsrc/api/get/rules.md', 'r');
put('xsrc/web/home/definition.md', '---\ntrigger: page\nentry: /\ngroup: main\n---\nHome.\n');
put('xsrc/web/home/actions.md', '## Open the page\n- Call: `api/get`\n- Code: `h#H`');
put('xsrc/web/home/boundary.md', '## Input\n');
put('xsrc/web/home/rules.md', 'r');
const md = readMirror(mir, '2026-01-02');
assert.equal(md.title, 'repo');
assert.equal(md.generated, '2026-01-02');
assert.deepEqual(plain(md.external), [{ id: 'db', kind: 'database', name: 'Postgres', status: null }]);
const [get, home] = [md.projects[0].flows[0], md.projects[1].flows[0]];
assert.deepEqual([get.kind, get.trigger, get.entry, get.group, get.definition], ['flow', 'http', 'GET /x', '', 'Get x.\n']);
assert.equal(get.actions, undefined);
assert.deepEqual([home.kind, home.group, home.steps[0].title, typeof home.actions], ['page', 'main', 'Open the page.', 'string']);
assert.equal(linkErrors(md).length, 0);

// main: builds visualize.html from the template, with the tokens and the linked data.
const tpl = '<style>/* MIRROR:TOKENS:START */\n:root{}\n/* MIRROR:TOKENS:END */</style><script type="application/json" id="mirror-data">{}</script>';
writeFileSync(join(tmp, 'tpl.html'), tpl);
const log = console.log, err = console.error, said = [];
console.log = console.error = (s) => said.push(String(s));
assert.equal(main([mir, '--template', join(tmp, 'tpl.html')]), 0);
const page = readFileSync(join(mir, 'visualize.html'), 'utf8');
assert.match(page, /\/\* MIRROR:TOKENS:START \*\/\n:root \{ --x: 1; \}\n\/\* MIRROR:TOKENS:END \*\//);
const built = pageData(page);
assert.deepEqual(built.system.edges.map((e) => e.from + '>' + e.to + ' ' + e.label), ['api>ext:db 1 reads', 'web>api 1 calls']);
assert.doesNotMatch(page.match(/id="mirror-data">([\s\S]*?)<\/script>/)[1], /</);

// main --review: statuses against the current page. A new page is added, a removed step is
// removed, a changed boundary gives `old.boundary`, and the removed link draws a removed line.
put('xsrc/api/get/boundary.md', '## Dependencies\n');
put('xsrc/api/get/steps.md', '## 1. Read x from the cache\n- Code: `a#c`');
put('xsrc/web/about/definition.md', '---\ntrigger: page\nentry: /about\n---\nAbout.\n');
put('xsrc/web/about/actions.md', '## Open the page\n- Code: `a#A`');
put('xsrc/web/about/boundary.md', '');
put('xsrc/web/about/rules.md', '');
assert.equal(main([mir, '--review', '0001-cache', '--template', join(tmp, 'tpl.html')]), 0);
const rv = pageData(readFileSync(join(mir, 'features', '0001-cache.html'), 'utf8'));
const rget = rv.projects[0].flows[0];
assert.equal(rget.status, 'changed');
assert.deepEqual(Object.keys(rget.old).sort(), ['boundary']);
assert.deepEqual(rget.steps.map((s) => s.status + ' ' + s.ref), ['removed a#b', 'added a#c']);
assert.deepEqual(rv.projects[1].flows.map((f) => f.id + ' ' + f.status), ['about added', 'home null']);
assert.deepEqual([rv.projects[0].status, rv.projects[1].status], ['changed', 'changed']);
assert.deepEqual(rv.system.edges.map((e) => e.to + ' ' + e.status), ['ext:db removed', 'api null']);

// reviewData: an external removed from config.json comes back as removed; an old page without
// actions gives `old.actions: null`.
const oldD = { external: [{ id: 'q' }], projects: [{ id: 'web', definition: 'd', flows: [{ id: 'p', boundary: 'b', steps: [] }] }] };
const newD = { external: [], projects: [{ id: 'web', definition: 'd', flows: [{ id: 'p', boundary: 'b', actions: '## A\n- Code: `a#b`', steps: [] }] }] };
const rd = reviewData(oldD, newD);
assert.deepEqual(plain(rd.external), [{ id: 'q', status: 'removed' }]);
assert.deepEqual(plain(rd.projects[0].flows[0].old), { actions: null });
assert.equal(reviewData(oldD, oldD).projects[0].status, undefined);

// A link error stops the build and writes nothing.
put('xsrc/api/get/boundary.md', '## Dependencies\n- reads `nope`');
said.length = 0;
assert.equal(main([mir, '--template', join(tmp, 'tpl.html')]), 1);
assert.deepEqual(said, ['api/get: unknown target `nope`', '1 link error(s). Nothing written.']);
assert.equal(readFileSync(join(mir, 'visualize.html'), 'utf8'), page);
assert.equal(main([]), 2);
console.log = log; console.error = err;
rmSync(tmp, { recursive: true, force: true });

console.log('ok');
