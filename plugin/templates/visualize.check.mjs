// Usage: node visualize.check.mjs [page.html]  (default: the template next to this file)
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { addLinks } from './build.mjs';

const path = process.argv[2] ?? new URL('./visualize.html', import.meta.url);
const html = readFileSync(path, 'utf8');

assert.match(html, /\/\* MIRROR:TOKENS:START \*\/[\s\S]*:root[\s\S]*\/\* MIRROR:TOKENS:END \*\//);
const data = JSON.parse(html.match(/<script type="application\/json" id="mirror-data">([\s\S]*?)<\/script>/)[1]);
assert.ok(Array.isArray(data.projects), 'data.projects must be an array');
for (const p of data.projects) for (const f of p.flows) assert.ok(Array.isArray(f.steps), `${p.id}/${f.id} steps`);

const ctx = {};
runInNewContext(html.match(/<script id="mirror-app">([\s\S]*?)<\/script>/)[1], ctx);
const { groups, renderMd, summary, model, cardHtml, matches, hasChanges, systemModel, tabFromHash, firstTabWithMatch, actionDetails } = ctx.MirrorViewer;
const plain = (x) => JSON.parse(JSON.stringify(x));

// The build puts the links in the data. The viewer only reads them.
assert.ok(data.external === undefined || Array.isArray(data.external), 'data.external must be an array');
assert.ok(data.system === undefined || Array.isArray(data.system.edges), 'data.system.edges must be an array');

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


// Data for the link views, as the build makes it.
const sys = addLinks({
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
});

// Search on the System tab: the first project tab with a matching flow or step, or -1.
assert.equal(firstTabWithMatch(sys, 'LIST'), 1);
assert.equal(firstTabWithMatch(sys, 'create'), 0);
assert.equal(firstTabWithMatch(sys, 'zzz'), -1);
assert.equal(firstTabWithMatch(sys, ' '), -1);

// A page with actions says "actions" and shows a mark, not a number. A flow still says "steps".
const shop = { id: 'web', flows: [{ id: 'shop', kind: 'page', trigger: 'page', entry: '/shop',
  actions: '## Open\n- Code: `a#b`', boundary: '',
  steps: [{ n: 1, title: 'Open.', text: 'Open.', details: [], ref: 'a#b' }, { n: 2, title: 'Click "Pay".', text: 'Click "Pay".', details: ['Call: `stripe`: pay.'], ref: 'a#c' }] }] };
const shopCard = cardHtml(model(shop).flows[0], true);
assert.match(shopCard, /aria-expanded="true">▾ 2 actions<\/button>/);
assert.match(shopCard, /<span class="n">•<\/span><span class="body">Open\.<\/span>/);
assert.doesNotMatch(shopCard, /<span class="n">1<\/span>/);
assert.match(cardHtml(model({ id: 'web', flows: [{ ...shop.flows[0], steps: [shop.flows[0].steps[0]] }] }).flows[0], false), /▸ 1 action<\/button>/);
assert.match(cardHtml(m.flows[0], false), /▸ 2 steps<\/button>/);
assert.equal(model(shop).flows[0].unit, 'action');
assert.equal(m.flows[0].unit, 'step');

// Chip of a Call to an external jumps to the external card.
const shopData = addLinks({ external: [{ id: 'stripe' }], projects: [{ id: 'web', flows: [{ id: 'shop', kind: 'page', actions: '## Pay\n- Call: `stripe`\n- Code: `a#b`' }] }] });
assert.match(cardHtml(model(shopData.projects[0]).flows[0], false), /data-goto="ext:stripe" title="calls">→ stripe</);

// Action details: a Call is a link to its target; Then and Fail stay text.
const keyOf = (to) => (to === 'stripe' ? 'ext:stripe' : to);
assert.equal(actionDetails(['Call: `stripe`: pay.', 'Then: open `/done`.', 'Fail: show <b>.'], keyOf),
  '<ul class="details"><li><span class="meta">Call</span> <button class="link" data-goto="ext:stripe">stripe</button> pay.</li>' +
  '<li><span class="meta">Then</span> open <code>/done</code>.</li><li><span class="meta">Fail</span> show &lt;b&gt;.</li></ul>');
assert.equal(actionDetails([], keyOf), '');
// BUILD ends each detail with a period: a Call without a note is still a link.
assert.equal(actionDetails(['Call: `stripe`.'], keyOf),
  '<ul class="details"><li><span class="meta">Call</span> <button class="link" data-goto="ext:stripe">stripe</button></li></ul>');
assert.equal(actionDetails(['Keep the draft.'], keyOf), '<ul class="details"><li>Keep the draft.</li></ul>');

// A flow card shows its links as chips that jump to the target. Two links to one target show one chip.
const newCard = cardHtml(model(sys.projects[1]).flows[0], false);
assert.match(newCard, /<div class="lchips"><button type="button" class="lchip" data-goto="api\/create" title="calls">→ api\/create<\/button><\/div>/);
assert.equal(newCard.match(/→ api\/create/g).length, 1);
const apiModel = model(sys.projects[0]);
const apiCard = cardHtml(apiModel.flows[0], false);
assert.match(apiCard, /data-goto="ext:posts-db" title="writes">→ posts-db</);
assert.match(apiCard, /data-goto="api\/other" title="calls">→ api\/other</);
assert.match(apiCard, /data-goto="web\/new" title="calls">← web\/new</);
assert.match(cardHtml(apiModel.flows[1], false), /data-goto="api\/create" title="calls">← api\/create</);
assert.doesNotMatch(cardHtml(m.flows[0], false), /lchips/);
assert.doesNotMatch(cardHtml(model({ id: 'api', flows: [{ id: 'x', steps: [] }] }).flows[0], false), /lchips/);

// The System tab holds each project and each external system as a card.
const sm = systemModel(sys);
assert.deepEqual(Array.from(sm.all, (n) => n.key), ['api', 'web', 'ext:posts-db']);
const extCard = cardHtml(sm.externals[0]);
assert.match(extCard, /class="card external" data-key="ext:posts-db"/);
assert.match(extCard, /<span class="badge">DATABASE<\/span>/);
assert.match(extCard, /<div class="sub">Postgres<\/div>/);
assert.doesNotMatch(extCard, /lchips/);
assert.match(cardHtml(systemModel({ external: [{ id: 'cache', kind: 'cache', status: 'removed' }] }).externals[0]), /class="card external st-removed"/);
assert.deepEqual(Array.from(sm.externals[0].into, (l) => l.from), ['api/create', 'web/list']);
assert.equal(sm.edges.length, 3);
assert.deepEqual(plain(systemModel({})), { projects: [], externals: [], all: [], edges: [] });
// Data built before links existed: no chips, no lines.
assert.deepEqual(Array.from(model({ id: 'a', flows: [{ id: 'f', boundary: '## Dependencies\n- calls `b`' }] }).flows[0].out), []);

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
