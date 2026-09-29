// Usage: node visualize.check.mjs [page.html]  (default: the template next to this file)
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';

const path = process.argv[2] ?? new URL('./visualize.html', import.meta.url);
const html = readFileSync(path, 'utf8');

assert.match(html, /\/\* MIRROR:TOKENS:START \*\/[\s\S]*:root[\s\S]*\/\* MIRROR:TOKENS:END \*\//);
const data = JSON.parse(html.match(/<script type="application\/json" id="mirror-data">([\s\S]*?)<\/script>/)[1]);
assert.ok(Array.isArray(data.projects), 'data.projects must be an array');
for (const p of data.projects) for (const f of p.flows) assert.ok(Array.isArray(f.steps), `${p.id}/${f.id} steps`);

const ctx = {};
runInNewContext(html.match(/<script id="mirror-app">([\s\S]*?)<\/script>/)[1], ctx);
const { groups, renderMd, summary, model, cardHtml, matches, hasChanges, parseLinks, linkIndex, systemEdges, linkErrors, systemModel, tabFromHash, firstTabWithMatch } = ctx.MirrorViewer;
const plain = (x) => JSON.parse(JSON.stringify(x));

// The links of the page under check must be valid.
assert.ok(data.external === undefined || Array.isArray(data.external), 'data.external must be an array');
assert.equal(linkErrors(data).join('\n'), '', 'link errors');

assert.equal(renderMd('<b>'), '<p>&lt;b&gt;</p>');
assert.equal(
  renderMd('## Input\n- a `x`\n- **b**\n\ntext'),
  '<h5>Input</h5><ul><li>a <code>x</code></li><li><strong>b</strong></li></ul><p>text</p>',
);
assert.equal(renderMd('1. one\n2. two'), '<ol><li>one</li><li>two</li></ol>');
assert.equal(renderMd('```\n<a>\n```'), '<pre><code>&lt;a&gt;</code></pre>');
assert.equal(
  renderMd('| A | B |\n| --- | --- |\n| `x` | <y> |'),
  '<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td><code>x</code></td><td>&lt;y&gt;</td></tr></tbody></table>',
);

// A card shows the first plain paragraph of the definition.
assert.equal(summary('# Title\n\nCreate a **post**.\nFor an author.\n\n## Stack\n- x'), 'Create a **post**. For an author.');
assert.equal(summary(''), '');

const sample = { id: 'api', kind: 'backend', definition: 'The API.', flows: [
  { id: 'a', kind: 'flow', trigger: 'http', entry: 'POST /a', definition: 'Do <a>.',
    steps: [{ n: 1, text: 's1', ref: '' }, { n: 2, title: 'Save.', text: 'Save. Return 400.', details: ['Return 400.'], ref: 'src/a.ts#postUser' }] },
  { id: 'b', kind: 'page', trigger: 'page', entry: '/b', steps: [] },
] };
const m = model(sample);
const at = (title) => m.all.find((n) => n.title === title);
assert.deepEqual(Array.from(m.all, (n) => n.key), ['api', 'api/a', 'api/a#0', 'api/a#1', 'api/b']);
assert.deepEqual([at('a').type, at('a').badge, at('b').type, at('b').badge], ['flow', 'HTTP', 'page', 'PAGE']);
assert.equal(m.flows[0].steps.length, 2);

// Flows go into groups by first use; flows without a group go last, in "other".
const gs = (list) => Array.from(groups(list.map((g, i) => ({ key: i, item: { group: g } }))), (g) => g.name + ':' + g.flows.map((f) => f.key).join(''));
assert.deepEqual(gs(['b', 'a', '', 'b']), ['b:03', 'a:1', 'other:2']);
assert.deepEqual(gs(['', undefined]), [':01']);

// A flow card holds its definition and a step toggle; the steps show only when it is open.
const closed = cardHtml(m.flows[0], false);
assert.match(closed, /data-key="api\/a"/);
assert.match(closed, /<p class="def">Do &lt;a&gt;\.<\/p>/);
assert.match(closed, /data-toggle="api\/a" aria-expanded="false">▸ 2 steps<\/button>/);
assert.doesNotMatch(closed, /<ol/);
const open = cardHtml(m.flows[0], true);
assert.match(open, /aria-expanded="true">▾ 2 steps/);
// A card step shows only its title; the drawer holds the details and the code link.
assert.match(open, /<li class="step" data-key="api\/a#1"[^>]*><span class="n">2<\/span><span class="body">Save\.<\/span><\/li>/);
assert.match(open, /<span class="body">s1<\/span>/);
assert.doesNotMatch(cardHtml(m.flows[1], true), /data-toggle/);
assert.match(cardHtml({ ...m.flows[0], status: 'added' }, false), /class="card flow st-added"/);

// Search matches title, sub (code ref, entry) and trigger, case-insensitive.
assert.equal(matches(at('1. s1'), 'S1'), true);
assert.equal(matches(at('2. Save. Return 400.'), 'postuser'), true);
assert.equal(matches(at('2. Save. Return 400.'), 'return 400'), true);
assert.equal(matches(at('a'), 'zzz'), false);
assert.equal(matches(at('a'), '  '), false);

// A project tab shows a change mark when any item in it has a review status.
assert.equal(hasChanges(sample), false);
assert.equal(hasChanges({ flows: [{ steps: [{ status: 'removed' }] }] }), true);
assert.equal(hasChanges({ status: 'bogus', flows: [] }), false);

// A diff keeps same lines, crosses out old lines, and marks new lines.
assert.equal(ctx.MirrorViewer.diffHtml('a\nb\nc', 'a\nx\nc'), '<div class="diff"><span>a</span><ins>x</ins><del>b</del><span>c</span></div>');
assert.equal(ctx.MirrorViewer.diffHtml('<a>', '<a>'), '<div class="diff"><span>&lt;a&gt;</span></div>');

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

// Search on the System tab: the first project tab with a matching flow or step, or -1.
assert.equal(firstTabWithMatch(sys, 'LIST'), 1);
assert.equal(firstTabWithMatch(sys, 'create'), 0);
assert.equal(firstTabWithMatch(sys, 'zzz'), -1);
assert.equal(firstTabWithMatch(sys, ' '), -1);

// A flow card shows its links as chips that jump to the target. Two links to one target show one chip.
const newCard = cardHtml(model(sys.projects[1], idx).flows[0], false);
assert.match(newCard, /<div class="lchips"><button type="button" class="lchip" data-goto="api\/create" title="calls">→ api\/create<\/button><\/div>/);
assert.equal(newCard.match(/→ api\/create/g).length, 1);
const apiModel = model(sys.projects[0], idx);
const apiCard = cardHtml(apiModel.flows[0], false);
assert.match(apiCard, /data-goto="ext:posts-db" title="writes">→ posts-db</);
assert.match(apiCard, /data-goto="api\/other" title="calls">→ api\/other</);
assert.match(apiCard, /data-goto="web\/new" title="calls">← web\/new</);
assert.match(cardHtml(apiModel.flows[1], false), /data-goto="api\/create" title="calls">← api\/create</);
assert.doesNotMatch(cardHtml(m.flows[0], false), /lchips/);
assert.doesNotMatch(cardHtml(model(sys.projects[0]).flows[0], false), /lchips/);

// The System tab holds each project and each external system as a card.
const sm = systemModel(sys, idx);
assert.deepEqual(Array.from(sm.all, (n) => n.key), ['api', 'web', 'ext:posts-db']);
const extCard = cardHtml(sm.externals[0]);
assert.match(extCard, /class="card external" data-key="ext:posts-db"/);
assert.match(extCard, /<span class="badge">DATABASE<\/span>/);
assert.match(extCard, /<div class="sub">Postgres<\/div>/);
assert.doesNotMatch(extCard, /lchips/);
assert.match(cardHtml(systemModel(gone, linkIndex(gone)).externals[0]), /class="card external st-removed"/);
assert.deepEqual(Array.from(sm.externals[0].into, (l) => l.from), ['api/create', 'web/list']);
assert.equal(sm.edges.length, 3);
assert.deepEqual(plain(systemModel({}, linkIndex({}))), { projects: [], externals: [], all: [], edges: [] });

// An external card has a color even when an older visualize.md has no --external token.
assert.match(html, /\.card\.external \{ --c: var\(--external, #[0-9a-f]{6}\); \}/);

// The hash picks the tab: a project id opens it; empty or unknown opens System (-1).
const ps = [{ id: 'api' }, { id: 'web app' }];
assert.equal(tabFromHash('#api', ps), 0);
assert.equal(tabFromHash('#web%20app', ps), 1);
assert.equal(tabFromHash('', ps), -1);
assert.equal(tabFromHash('#nope', ps), -1);
assert.equal(tabFromHash('#%E0%A4%A', ps), -1);

console.log('ok');
