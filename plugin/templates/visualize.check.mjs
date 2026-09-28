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
const { groups, renderMd, summary, model, cardHtml, matches, hasChanges } = ctx.MirrorViewer;

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

const sample = { id: 'api', kinds: ['backend'], definition: 'The API.', flows: [
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

console.log('ok');
