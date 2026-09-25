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
const { renderMd, layout, matches, hasChanges } = ctx.MirrorViewer;

assert.equal(renderMd('<b>'), '<p>&lt;b&gt;</p>');
assert.equal(
  renderMd('## Input\n- a `x`\n- **b**\n\ntext'),
  '<h5>Input</h5><ul><li>a <code>x</code></li><li><strong>b</strong></li></ul><p>text</p>',
);
assert.equal(renderMd('1. one\n2. two'), '<ol><li>one</li><li>two</li></ol>');
assert.equal(renderMd('```\n<a>\n```'), '<pre><code>&lt;a&gt;</code></pre>');

const sample = { projects: [{ id: 'api', kinds: ['backend'], flows: [
  { id: 'a', kind: 'flow', steps: [{ n: 1, text: 's1', ref: '' }, { n: 2, text: 's2', ref: 'src/a.ts#postUser' }] },
  { id: 'b', kind: 'page', steps: [] },
] }] };
const t = { boxW: 100, boxH: 20, gapX: 10, gapY: 5 };
const g = layout(sample, t);
const at = (title) => g.nodes.find((n) => n.title === title);
assert.equal(g.nodes.length, 5);
assert.equal(g.edges.length, 4);
assert.deepEqual([at('1. s1').x, at('1. s1').y, at('2. s2').y], [220, 0, 25]);
assert.deepEqual([at('a').x, at('a').y, at('a').type], [110, 12.5, 'flow']);
assert.deepEqual([at('b').y, at('b').type], [50, 'page']);
assert.deepEqual([at('api').x, at('api').y], [0, 31.25]);
assert.equal(g.height, 100);
assert.deepEqual(Array.from(g.nodes, (n) => n.key).sort(), ['api', 'api/a', 'api/a#0', 'api/a#1', 'api/b']);

// A collapsed flow hides its steps and takes one row.
const c = layout(sample, t, { 'api/a': true });
const cat = (title) => c.nodes.find((n) => n.title === title);
assert.equal(c.nodes.length, 3);
assert.equal(c.edges.length, 2);
assert.deepEqual([cat('a').y, cat('a').collapsed, cat('a').count], [0, true, 2]);
assert.deepEqual([cat('b').y, cat('api').y, c.height], [25, 12.5, 75]);

// Search matches title, sub (code ref, entry) and trigger, case-insensitive.
assert.equal(matches(at('1. s1'), 'S1'), true);
assert.equal(matches(at('2. s2'), 'postuser'), true);
assert.equal(matches(at('a'), 'zzz'), false);
assert.equal(matches(at('a'), '  '), false);

// A project tab shows a change mark when any item in it has a review status.
assert.equal(hasChanges(sample.projects[0]), false);
assert.equal(hasChanges({ flows: [{ steps: [{ status: 'removed' }] }] }), true);
assert.equal(hasChanges({ status: 'bogus', flows: [] }), false);

console.log('ok');
