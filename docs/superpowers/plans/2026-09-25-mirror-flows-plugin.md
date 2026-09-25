# Mirror v2 (flows + plugin) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Mirror into a Claude Code plugin whose mirrors describe flows and pages (not files), drawn by one static `visualize.html`.

**Architecture:** This repo becomes the plugin: `.claude-plugin/` manifests, two skills (`init`, `add-feature`), and `templates/` (viewer HTML, default tokens, agent rules) plus one shared procedure in `references/`. The viewer is a single dependency-free HTML file; skills fill two marked regions (CSS tokens, JSON data). The old React app and per-file docs are deleted and this repo's demo `code/` is migrated to the new layout.

**Tech Stack:** Markdown skills, plain HTML/CSS/ES5-style JS (inline, no deps), Node 20 built-ins (`node:vm`, `node:assert`) for the one check script.

**Spec:** [docs/superpowers/specs/2026-09-25-mirror-flows-plugin-design.md](../specs/2026-09-25-mirror-flows-plugin-design.md)

## Global Constraints

- Viewer: one file, inline CSS and JS, no external requests, works from `file://`.
- Token markers: `/* MIRROR:TOKENS:START */` and `/* MIRROR:TOKENS:END */`.
- Data block: `<script type="application/json" id="mirror-data">`; `<` escaped as `\u003c`.
- Flow file set: `definition.md`, `steps.md`, `boundary.md`, `rules.md`.
- Flow `definition.md` frontmatter: `trigger` (`http | main | message | schedule | page`), `entry`.
- Step line format: `N. Sentence. \`path/relative/to/project/root#function\``.
- `status` values: `added`, `changed`, `removed`, `null`.
- Project `kinds`: `backend`, `worker`, `consumer`, `frontend`, `expo`.
- Review pages: `.mirror/features/NNNN-<slug>.html`, 4-digit, next free number.
- All prompts (skills, mirror md files) in ASD-STE100 Simplified Technical English, one imperative per sentence.
- Skills reference plugin files as `${CLAUDE_PLUGIN_ROOT}/…`.

## File Map

| Path | Responsibility |
| --- | --- |
| `templates/visualize.html` | Viewer template (layout, markdown render, side panel). |
| `templates/visualize.check.mjs` | Runs viewer pure functions in Node; validates a built page. |
| `templates/visualize.md` | Default tokens + meaning. |
| `templates/AGENTS.md` | Content of a target repo's `.mirror/AGENTS.md`. |
| `references/build-visualize.md` | Shared procedure: md files → data JSON → page. |
| `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | Plugin manifests. |
| `skills/init/SKILL.md` | `init` skill. |
| `skills/add-feature/SKILL.md` | `add-feature` skill. |
| `.mirror/**` | This repo's own mirror, migrated. |

---

### Task 1: Viewer template and check script

**Files:**
- Create: `templates/visualize.check.mjs`
- Create: `templates/visualize.html`

**Interfaces:**
- Produces: `globalThis.MirrorViewer = { esc(s): string, renderMd(text): string, layout(data, t): { nodes, edges, width, height } }` where `t = { boxW, boxH, gapX, gapY }` numbers. Node: `{ type: 'project'|'flow'|'page'|'step', title, sub, status, item, x, y }`. Edge: `[parentNode, childNode]`.
- Produces: CLI `node templates/visualize.check.mjs [path-to-html]` → prints `ok` or throws.

- [ ] **Step 1: Write the check script**

`templates/visualize.check.mjs`:

```js
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
const { renderMd, layout } = ctx.MirrorViewer;

assert.equal(renderMd('<b>'), '<p>&lt;b&gt;</p>');
assert.equal(
  renderMd('## Input\n- a `x`\n- **b**\n\ntext'),
  '<h5>Input</h5><ul><li>a <code>x</code></li><li><strong>b</strong></li></ul><p>text</p>',
);
assert.equal(renderMd('1. one\n2. two'), '<ol><li>one</li><li>two</li></ol>');
assert.equal(renderMd('```\n<a>\n```'), '<pre><code>&lt;a&gt;</code></pre>');

const g = layout(
  { projects: [{ id: 'api', kinds: ['backend'], flows: [
    { id: 'a', kind: 'flow', steps: [{ n: 1, text: 's1', ref: '' }, { n: 2, text: 's2', ref: '' }] },
    { id: 'b', kind: 'page', steps: [] },
  ] }] },
  { boxW: 100, boxH: 20, gapX: 10, gapY: 5 },
);
const at = (title) => g.nodes.find((n) => n.title === title);
assert.equal(g.nodes.length, 5);
assert.equal(g.edges.length, 4);
assert.deepEqual([at('1. s1').x, at('1. s1').y, at('2. s2').y], [220, 0, 25]);
assert.deepEqual([at('a').x, at('a').y, at('a').type], [110, 12.5, 'flow']);
assert.deepEqual([at('b').y, at('b').type], [50, 'page']);
assert.deepEqual([at('api').x, at('api').y], [0, 31.25]);
assert.equal(g.height, 100);

console.log('ok');
```

- [ ] **Step 2: Run it to see it fail**

Run: `node templates/visualize.check.mjs`
Expected: FAIL with `ENOENT` (no `visualize.html` yet).

- [ ] **Step 3: Write the template**

`templates/visualize.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mirror</title>
<style>
/* MIRROR:TOKENS:START */
:root {
  --bg: #0f1115;  --panel: #171a21;  --text: #e6e6e6;  --muted: #8a8f98;
  --project: #6c8cff;  --flow: #3fb68b;  --page: #e0a84f;  --step: #8a8f98;
  --added: #2ea043;  --changed: #d29922;  --removed: #f85149;
  --box-w: 220px;  --box-h: 56px;  --gap-x: 80px;  --gap-y: 24px;
  --radius: 8px;  --font: system-ui, sans-serif;
}
/* MIRROR:TOKENS:END */
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; }
body { background: var(--bg); color: var(--text); font-family: var(--font); display: flex; flex-direction: column; }
header { display: flex; gap: 16px; align-items: center; padding: 10px 16px; border-bottom: 1px solid var(--panel); }
header h1 { font-size: 16px; margin: 0; }
.meta { color: var(--muted); font-size: 12px; }
#legend { display: none; gap: 12px; margin-left: auto; font-size: 12px; }
#legend.on { display: flex; }
#legend span::before { content: ""; display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 6px; background: var(--c); }
main { flex: 1; display: flex; min-height: 0; }
#canvas { flex: 1; overflow: auto; }
#canvas svg { display: block; }
.node { cursor: pointer; }
.node rect { fill: var(--panel); stroke: var(--c); stroke-width: 2; }
.node text { fill: var(--text); font-size: 13px; pointer-events: none; }
.node text.sub { fill: var(--muted); font-size: 11px; }
.node.project { --c: var(--project); }
.node.flow { --c: var(--flow); }
.node.page { --c: var(--page); }
.node.step { --c: var(--step); }
.node.st-added rect { stroke: var(--added); stroke-width: 3; }
.node.st-changed rect { stroke: var(--changed); stroke-width: 3; }
.node.st-removed { opacity: .6; }
.node.st-removed rect { stroke: var(--removed); stroke-width: 3; stroke-dasharray: 6 4; }
.node.sel rect { stroke-width: 4; }
.edge { fill: none; stroke: var(--muted); stroke-width: 1.5; opacity: .6; }
#panel { width: 380px; max-width: 45vw; overflow: auto; background: var(--panel); padding: 16px; }
#panel h2 { font-size: 15px; margin: 0 0 4px; }
#panel h3 { font-size: 12px; text-transform: uppercase; color: var(--muted); margin: 18px 0 6px; }
#panel code { background: var(--bg); padding: 1px 4px; border-radius: 4px; }
#panel pre { background: var(--bg); padding: 8px; overflow: auto; }
@media (max-width: 700px) {
  main { flex-direction: column; }
  #panel { width: auto; max-width: none; max-height: 45vh; }
}
</style>
</head>
<body>
<header>
  <h1 id="title">Mirror</h1>
  <span class="meta" id="meta"></span>
  <div id="legend">
    <span style="--c: var(--added)">added</span>
    <span style="--c: var(--changed)">changed</span>
    <span style="--c: var(--removed)">removed</span>
  </div>
</header>
<main>
  <div id="canvas"></div>
  <aside id="panel"><p class="meta">Click a box to see its details.</p></aside>
</main>
<script type="application/json" id="mirror-data">
{"generated":"","title":"Mirror","projects":[]}
</script>
<script id="mirror-app">
(function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  // Headings, bullet and numbered lists, code fences, paragraphs. Input is escaped first.
  function renderMd(text) {
    var out = [], list = null, code = null;
    function closeList() { if (list) { out.push('</' + list + '>'); list = null; } }
    function openList(tag) { if (list !== tag) { closeList(); list = tag; out.push('<' + tag + '>'); } }
    String(text || '').split(/\r?\n/).forEach(function (line) {
      var m;
      if (code !== null) {
        if (/^```/.test(line)) { out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>'); code = null; }
        else code.push(line);
        return;
      }
      if (/^```/.test(line)) { closeList(); code = []; return; }
      if ((m = /^(#{1,6})\s+(.*)$/.exec(line))) {
        closeList();
        var lv = Math.min(m[1].length + 3, 6);
        out.push('<h' + lv + '>' + inline(m[2]) + '</h' + lv + '>');
        return;
      }
      if ((m = /^\s*[-*]\s+(.*)$/.exec(line))) { openList('ul'); out.push('<li>' + inline(m[1]) + '</li>'); return; }
      if ((m = /^\s*\d+\.\s+(.*)$/.exec(line))) { openList('ol'); out.push('<li>' + inline(m[1]) + '</li>'); return; }
      closeList();
      if (line.trim()) out.push('<p>' + inline(line) + '</p>');
    });
    closeList();
    if (code !== null) out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>');
    return out.join('');
  }

  // Columns: project, flow/page, step. Each step takes one row; a parent sits at the middle of its children.
  function layout(data, t) {
    var nodes = [], edges = [], row = 0;
    var rowH = t.boxH + t.gapY, colW = t.boxW + t.gapX;
    function add(n, col, y) { n.x = col * colW; n.y = y; nodes.push(n); return n; }
    function mid(list) { return (list[0].y + list[list.length - 1].y) / 2; }
    (data.projects || []).forEach(function (p) {
      var flowNodes = [];
      (p.flows || []).forEach(function (f) {
        var stepNodes = (f.steps || []).map(function (s) {
          return add({ type: 'step', title: s.n + '. ' + s.text, sub: s.ref || '', status: s.status || null, item: s, parent: f }, 2, row++ * rowH);
        });
        var fn = add({ type: f.kind === 'page' ? 'page' : 'flow', title: f.id, sub: f.entry || '', status: f.status || null, item: f },
          1, stepNodes.length ? mid(stepNodes) : row++ * rowH);
        stepNodes.forEach(function (s) { edges.push([fn, s]); });
        flowNodes.push(fn);
      });
      var pn = add({ type: 'project', title: p.id, sub: (p.kinds || []).join(', '), status: p.status || null, item: p },
        0, flowNodes.length ? mid(flowNodes) : row++ * rowH);
      flowNodes.forEach(function (f) { edges.push([pn, f]); });
      row++; // empty row between projects
    });
    return { nodes: nodes, edges: edges, width: 3 * colW - t.gapX, height: Math.max(row * rowH, t.boxH) };
  }

  var SVG = 'http://www.w3.org/2000/svg';
  function el(name, attrs) {
    var e = document.createElementNS(SVG, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function clip(s, max) { s = String(s || ''); return s.length > max ? s.slice(0, max - 1) + '…' : s; }

  function tokens() {
    var cs = getComputedStyle(document.documentElement);
    function n(name) { return parseFloat(cs.getPropertyValue(name)) || 0; }
    return { boxW: n('--box-w'), boxH: n('--box-h'), gapX: n('--gap-x'), gapY: n('--gap-y'), radius: n('--radius') };
  }

  function show(n) {
    var it = n.item, h = ['<h2>' + esc(n.title) + '</h2>'];
    if (n.type === 'step') {
      h.push('<h3>Code</h3><p><code>' + esc(it.ref || '') + '</code></p>', '<h3>Flow</h3><p>' + esc(n.parent.id) + '</p>');
    } else {
      if (n.sub) h.push('<p class="meta">' + esc(n.sub) + '</p>');
      [['Definition', it.definition], ['Boundary', it.boundary], ['Rules', it.rules]].forEach(function (s) {
        if (s[1]) h.push('<h3>' + s[0] + '</h3>' + renderMd(s[1]));
      });
    }
    if (it.status) h.push('<p class="meta">status: ' + esc(it.status) + '</p>');
    document.getElementById('panel').innerHTML = h.join('');
  }

  function main() {
    var data = JSON.parse(document.getElementById('mirror-data').textContent);
    document.title = data.title || 'Mirror';
    document.getElementById('title').textContent = data.title || 'Mirror';
    document.getElementById('meta').textContent = data.generated ? 'generated ' + data.generated : '';
    var t = tokens(), g = layout(data, t), pad = 16;
    var svg = el('svg', { width: g.width + 2 * pad, height: g.height + 2 * pad });
    var root = el('g', { transform: 'translate(' + pad + ',' + pad + ')' });
    svg.appendChild(root);
    g.edges.forEach(function (e) {
      var a = e[0], b = e[1], x1 = a.x + t.boxW, y1 = a.y + t.boxH / 2, x2 = b.x, y2 = b.y + t.boxH / 2, mx = (x1 + x2) / 2;
      root.appendChild(el('path', { 'class': 'edge', d: 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2 }));
    });
    var chars = Math.floor((t.boxW - 20) / 7), selected = null, anyStatus = false;
    g.nodes.forEach(function (n) {
      if (n.status) anyStatus = true;
      var ge = el('g', { 'class': 'node ' + n.type + (n.status ? ' st-' + n.status : ''), transform: 'translate(' + n.x + ',' + n.y + ')' });
      ge.appendChild(el('rect', { width: t.boxW, height: t.boxH, rx: t.radius }));
      var title = el('text', { x: 10, y: n.sub ? t.boxH / 2 - 4 : t.boxH / 2 + 4 });
      title.textContent = clip(n.title, chars);
      ge.appendChild(title);
      if (n.sub) {
        var sub = el('text', { x: 10, y: t.boxH / 2 + 14, 'class': 'sub' });
        sub.textContent = clip(n.sub, chars + 4);
        ge.appendChild(sub);
      }
      var tip = el('title', {});
      tip.textContent = n.title + (n.sub ? '\n' + n.sub : '');
      ge.appendChild(tip);
      ge.addEventListener('click', function () {
        if (selected) selected.classList.remove('sel');
        selected = ge;
        ge.classList.add('sel');
        show(n);
      });
      root.appendChild(ge);
    });
    document.getElementById('canvas').appendChild(svg);
    if (anyStatus) document.getElementById('legend').classList.add('on');
  }

  globalThis.MirrorViewer = { esc: esc, renderMd: renderMd, layout: layout };
  if (typeof document !== 'undefined') main();
})();
</script>
</body>
</html>
```

- [ ] **Step 4: Run the check**

Run: `node templates/visualize.check.mjs`
Expected: prints `ok`.

- [ ] **Step 5: Commit**

```bash
git add templates/visualize.html templates/visualize.check.mjs
git commit -m "feat(templates): add the static flow viewer and its check"
```

---

### Task 2: Default tokens, agent rules, and the build procedure

**Files:**
- Create: `templates/visualize.md`
- Create: `templates/AGENTS.md`
- Create: `references/build-visualize.md`

**Interfaces:**
- Consumes: template markers and data shape from Task 1.
- Produces: `references/build-visualize.md` sections "Build the data", "Write the page", "Feature review data". Tasks 3 and 4 point to these by name.

- [ ] **Step 1: Write `templates/visualize.md`**

````markdown
# Visualize tokens

`visualize.html` copies the `:root` block below into its style. Edit a value here, then
rebuild `visualize.html`. Keep the variable names.

```css
:root {
  --bg: #0f1115;  --panel: #171a21;  --text: #e6e6e6;  --muted: #8a8f98;
  --project: #6c8cff;  --flow: #3fb68b;  --page: #e0a84f;  --step: #8a8f98;
  --added: #2ea043;  --changed: #d29922;  --removed: #f85149;
  --box-w: 220px;  --box-h: 56px;  --gap-x: 80px;  --gap-y: 24px;
  --radius: 8px;  --font: system-ui, sans-serif;
}
```

| Token | Meaning |
| --- | --- |
| `--bg`, `--panel` | Page background. Box and side panel background. |
| `--text`, `--muted` | Main text. Secondary text, edges. |
| `--project` | Border of a project box. |
| `--flow` | Border of a backend, worker or consumer flow box. |
| `--page` | Border of a frontend or Expo page box. |
| `--step` | Border of a step box. |
| `--added`, `--changed`, `--removed` | Border of a box on a feature review page. |
| `--box-w`, `--box-h` | Size of each box, in px. |
| `--gap-x`, `--gap-y` | Space between columns and between rows, in px. |
| `--radius` | Corner radius of each box, in px. |
| `--font` | Font family. |
````

- [ ] **Step 2: Write `templates/AGENTS.md`**

```markdown
# Mirror — Agent Instructions

Mirror keeps the intent of each flow and page next to the code.

## Layout

- `.mirror/config.json`: the projects, their root folders, and their kinds.
- `.mirror/xsrc/<project>/definition.md`: what the project is for, its stack, its technical decisions.
- `.mirror/xsrc/<project>/<flow-or-page>/`: `definition.md`, `steps.md`, `boundary.md`, `rules.md`.
- `.mirror/visualize.html`: the current graph. `.mirror/visualize.md`: its colors and sizes.
- `.mirror/features/`: the review page of each past feature.

## Rules

1. Write all prompts in ASD-STE100 Simplified Technical English.
2. Write one imperative instruction per sentence, in the active voice.
3. Change the flow folder before you change the code. Use the `mirror:add-feature` skill for a new feature or a change in behavior.
4. Keep each code reference in `steps.md` true. The form is `path#function`. The path is relative to the project root in `.mirror/config.json`.
5. Rebuild `.mirror/visualize.html` after each change to `.mirror/xsrc/`.
```

- [ ] **Step 3: Write `references/build-visualize.md`**

````markdown
# Build visualize.html

The `init` and `add-feature` skills use this procedure.

## Inputs

- `.mirror/config.json`
- `.mirror/visualize.md`
- `.mirror/xsrc/**`
- The template: `${CLAUDE_PLUGIN_ROOT}/templates/visualize.html`

## Build the data

1. Make one project entry for each key in `projects` of `config.json`. Keep the key order.
   - `id`: the key.
   - `kinds`: the `kinds` value from `config.json`.
   - `definition`: the full text of `xsrc/<project>/definition.md`.
   - `status`: `null`.
   - `flows`: see step 2.
2. Make one flow entry for each sub-folder of `xsrc/<project>/`. Sort by folder name.
   - `id`: the folder name.
   - `trigger`, `entry`: the values from the frontmatter of `definition.md`.
   - `kind`: `page` when `trigger` is `page`. Else `flow`.
   - `definition`: the text of `definition.md` after the frontmatter.
   - `boundary`, `rules`: the full text of `boundary.md` and `rules.md`.
   - `status`: `null`.
   - `steps`: one entry for each numbered item in `steps.md`, in order.
     - `n`: the number of the item.
     - `ref`: the text of the last backtick span on the line that contains `#`. Use `""` when there is none.
     - `text`: the item text without that backtick span, trimmed.
     - `status`: `null`.
3. Set `generated` to today in the form `YYYY-MM-DD`. Set `title` to the repository folder name.
4. Write the data as JSON. Replace each `</` with `<\/`.

The shape:

```json
{
  "generated": "2026-09-25",
  "title": "my-repo",
  "projects": [{
    "id": "api", "kinds": ["backend"], "definition": "…", "status": null,
    "flows": [{
      "id": "create-user", "kind": "flow", "trigger": "http", "entry": "POST /users",
      "definition": "…", "boundary": "…", "rules": "…", "status": null,
      "steps": [{ "n": 1, "text": "Validate the body.", "ref": "src/users/route.ts#postUser", "status": null }]
    }]
  }]
}
```

## Write the page

1. Copy the template to the target path.
2. Replace the text between `/* MIRROR:TOKENS:START */` and `/* MIRROR:TOKENS:END */` with
   the `:root { … }` block from the `css` fence in `.mirror/visualize.md`.
3. Replace the content of `<script type="application/json" id="mirror-data">` with the JSON.
4. Run `node "${CLAUDE_PLUGIN_ROOT}/templates/visualize.check.mjs" <target path>`. It must print `ok`.
   Fix the page and run it again when it fails.

## Feature review data

Use this section only in `add-feature`.

1. Read the old data: the JSON in `<script id="mirror-data">` of the current `.mirror/visualize.html`.
2. Build the new data from `.mirror/xsrc/` with the steps above.
3. Compare project by `id`, flow by project `id` + flow `id`, and step by `ref` + `text`.
   - A project, flow or step only in the new data: set `status` to `added`.
   - A project, flow or step only in the old data: copy it into the new data at its old
     position and set `status` to `removed`. Set each child of a removed item to `removed`.
   - A flow in both with a different `trigger`, `entry`, `definition`, `boundary`, `rules`
     or step list: set `status` to `changed`.
   - A project in both with a different `definition` or with a flow that is not `null`: set
     `status` to `changed`.
4. Write the page with "Write the page" to `.mirror/features/NNNN-<slug>.html`.
````

- [ ] **Step 4: Commit**

```bash
git add templates/visualize.md templates/AGENTS.md references/build-visualize.md
git commit -m "feat(templates): add default tokens, agent rules, and the build procedure"
```

---

### Task 3: Plugin manifests and the `init` skill

**Files:**
- Create: `.claude-plugin/plugin.json`
- Create: `.claude-plugin/marketplace.json`
- Create: `skills/init/SKILL.md`

**Interfaces:**
- Consumes: `templates/*`, `references/build-visualize.md` ("Build the data", "Write the page").
- Produces: skill `mirror:init`.

- [ ] **Step 1: Write `.claude-plugin/plugin.json`**

```json
{
  "name": "mirror",
  "version": "0.1.0",
  "description": "Keep the intent of each flow and page next to the code, and draw it as a graph.",
  "author": { "name": "Furkan Aydın" }
}
```

- [ ] **Step 2: Write `.claude-plugin/marketplace.json`**

```json
{
  "name": "mirror",
  "owner": { "name": "Furkan Aydın" },
  "plugins": [
    {
      "name": "mirror",
      "source": "./",
      "description": "Keep the intent of each flow and page next to the code, and draw it as a graph."
    }
  ]
}
```

- [ ] **Step 3: Write `skills/init/SKILL.md`**

````markdown
---
name: init
description: Create the Mirror folder for a repository. Find each project, find where each flow or page starts, write the flow documents, and draw them in .mirror/visualize.html. Use when the user asks to init, set up, or bootstrap Mirror.
---

# Mirror init

Write all documents in ASD-STE100 Simplified Technical English. Write one imperative
instruction per sentence.

## 0. Check the state

If `.mirror/xsrc/` exists, stop. Ask the user: overwrite it, or keep it and add only the
missing flows and pages. Do what the user selects.

## 1. Find the projects

1. Read the manifests in the repository: `package.json`, `app.json`, `pnpm-workspace.yaml`,
   `go.mod`, `pyproject.toml`, `*.csproj`, `Cargo.toml`, `Dockerfile`.
2. Give each project a short kebab-case id, a `root` (repository-relative), and `kinds`:
   - `backend`: it serves HTTP, GraphQL or RPC.
   - `worker`: it runs a process from `main` or on a schedule.
   - `consumer`: it handles messages from a queue or a topic.
   - `frontend`: a web app with pages.
   - `expo`: an Expo or React Native app with screens.
3. Show the list to the user as a table. Wait for an OK. Apply the changes the user asks for.
4. Write `.mirror/config.json`:

```json
{ "projects": { "<id>": { "root": "<path>", "kinds": ["backend"] } } }
```

## 2. Find the entry points

For each project, find where each flow starts:

| Kind | One flow per | `trigger` | `entry` |
| --- | --- | --- | --- |
| `backend` | HTTP endpoint (method + path) | `http` | `POST /users` |
| `worker` | process start or scheduled job | `main` or `schedule` | script name or cron |
| `consumer` | message handler | `message` | queue or topic name |
| `frontend`, `expo` | page or screen route | `page` | route path |

Name each flow in kebab-case with a verb first: `create-user`, `send-message`,
`list-owner-orders`. Name each page after its route: `home`, `profile`, `order-detail`.

Show the list per project to the user. Wait for an OK. The user can rename, merge or drop items.

## 3. Write the documents

1. Write `.mirror/xsrc/<project>/definition.md`:
   - The first paragraph: what the project is for.
   - `## Stack`: language, framework, main libraries, how to start it.
   - `## Technical decisions`: the choices that apply to many flows (storage, validation,
     error mapping, auth).
2. For each flow or page, trace the code from the entry point. Then write
   `.mirror/xsrc/<project>/<flow>/`:

`definition.md`:

```markdown
---
trigger: http
entry: POST /users
---
Create a user account.
```

`steps.md`: a numbered list. Write one step per function that does a distinct part of the
work. End each step with the code reference in backticks. The path is relative to the
project root.

```markdown
1. Validate the request body. `src/users/users.schema.ts#parseCreateUser`
2. Save the user. `src/users/users.service.ts#createUser`
3. Return HTTP 201 with the user. `src/users/users.route.ts#postUser`
```

`boundary.md`: three sections. `## Input`: the request, message or route params.
`## Output`: each response or effect, with each error. `## Dependencies`: databases, queues,
external APIs, and other flows.

`rules.md`: a bullet list of business rules, then `## Acceptance criteria` with one bullet
per testable result. Read the tests to find the rules.

For a page, the steps describe data loads and user actions, and the boundary lists the API
calls of the page.

## 4. Draw

1. Copy `${CLAUDE_PLUGIN_ROOT}/templates/visualize.md` to `.mirror/visualize.md` if it does
   not exist.
2. Build `.mirror/visualize.html` with `${CLAUDE_PLUGIN_ROOT}/references/build-visualize.md`
   ("Build the data", then "Write the page").

## 5. Agent rules

1. Copy `${CLAUDE_PLUGIN_ROOT}/templates/AGENTS.md` to `.mirror/AGENTS.md` if it does not exist.
2. If the repository root has no `AGENTS.md`, create it with this text:
   `This repository uses Mirror. Read [.mirror/AGENTS.md](.mirror/AGENTS.md) and follow it.`

## 6. Report

Tell the user the number of projects, flows and pages. Tell the user to open
`.mirror/visualize.html` in a browser.
````

- [ ] **Step 4: Validate the manifests**

Run: `node -e "for (const f of ['.claude-plugin/plugin.json','.claude-plugin/marketplace.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('ok')"`
Expected: `ok`.

- [ ] **Step 5: Commit**

```bash
git add .claude-plugin skills/init
git commit -m "feat(plugin): add the plugin manifests and the init skill"
```

---

### Task 4: The `add-feature` skill

**Files:**
- Create: `skills/add-feature/SKILL.md`

**Interfaces:**
- Consumes: `references/build-visualize.md` (all three sections).
- Produces: skill `mirror:add-feature`.

- [ ] **Step 1: Write `skills/add-feature/SKILL.md`**

````markdown
---
name: add-feature
description: Add or change a feature the Mirror way. Change the flow documents in .mirror/xsrc first, show a review page of the change, and change the code only after the user approves. Use when the user asks to add a feature, change a behavior, or add a flow or page in a repository that has a .mirror folder.
---

# Mirror add-feature

Write all documents in ASD-STE100 Simplified Technical English. Write one imperative
instruction per sentence.

If `.mirror/config.json` does not exist, stop. Tell the user to run `mirror:init` first.

## 1. Understand the feature

1. Read `.mirror/AGENTS.md`, `.mirror/config.json`, and the `definition.md` of each project.
2. Ask the user about the parts of the feature that are not clear. Ask one question at a time.
3. List the projects and the flows or pages that the feature adds, changes or removes.

## 2. Change the mirror

Change only files under `.mirror/xsrc/`. Do not change code in this step.

- A new flow or page: create the folder with `definition.md`, `steps.md`, `boundary.md`,
  `rules.md`. Use the formats in `.mirror/AGENTS.md` and the existing flows.
- A changed flow or page: edit its files.
- A removed flow or page: delete its folder.

Each new step names the function that will do the work, also when the function does not
exist yet.

## 3. Build the review page

1. Find the next free number `NNNN` in `.mirror/features/`. Start at `0001`.
2. Make a kebab-case `<slug>` from the feature name.
3. Follow "Feature review data" in `${CLAUDE_PLUGIN_ROOT}/references/build-visualize.md`.
   Write `.mirror/features/NNNN-<slug>.html`.

## 4. Review gate

Tell the user to open `.mirror/features/NNNN-<slug>.html`. List the added, changed and
removed flows and steps. Stop and wait for the answer.

- The user asks for changes: edit the files under `.mirror/xsrc/`. Build the same review page
  again. Ask again.
- The user cancels: run `git checkout -- .mirror/xsrc` and `git clean -fd .mirror/xsrc`.
  Delete the review page. Stop.
- The user gives an explicit OK: go to step 5. Do not go to step 5 without it.

## 5. Execute

1. For each added or changed flow, write tests for its `rules.md` acceptance criteria. Run
   them. Make sure that the new tests fail.
2. Write the code for the steps. Put each function at the path and name in its step.
3. Run the full test suite of each changed project. Make sure that all tests pass.
4. Remove the code of each removed flow and its tests.
5. For each changed `steps.md`, make sure that each `path#function` exists in the code. Fix
   the document or the code when they do not agree.
6. Build `.mirror/visualize.html` with "Build the data" and "Write the page" in
   `${CLAUDE_PLUGIN_ROOT}/references/build-visualize.md`. All `status` values are `null`.

## 6. Report

List the changed documents, the changed code files, and the test result.
````

- [ ] **Step 2: Commit**

```bash
git add skills/add-feature
git commit -m "feat(plugin): add the add-feature skill"
```

---

### Task 5: Migrate this repository

**Files:**
- Delete: `.mirror/visualize/`, `.mirror/docs/`, `.mirror/STRUCTURE.md`
- Modify: `.mirror/config.json`, `.mirror/AGENTS.md`, `.gitignore`, `README.md`
- Create: `.mirror/visualize.md`, `.mirror/visualize.html`, `.mirror/xsrc/api/**`

**Interfaces:**
- Consumes: everything from Tasks 1–2.

- [ ] **Step 1: Delete the old parts**

```bash
git rm -r -q .mirror/visualize .mirror/docs .mirror/STRUCTURE.md
```

In `.gitignore`, delete the line `.mirror/visualize/src/generated/`.

- [ ] **Step 2: Write config, agent rules, tokens**

`.mirror/config.json`:

```json
{ "projects": { "api": { "root": "code", "kinds": ["backend"] } } }
```

Copy `templates/AGENTS.md` to `.mirror/AGENTS.md` and `templates/visualize.md` to
`.mirror/visualize.md`.

- [ ] **Step 3: Write `.mirror/xsrc/api/definition.md`**

```markdown
The `api` project is an HTTP API for bubbles. A bubble is one unit of work. An owner creates a bubble and completes it.

## Stack

- TypeScript on Node 20 or later. Express 4. zod. vitest and supertest for the tests.
- Start it with `npm -C code run dev`. It reads the port from `PORT`. The default port is 3000.

## Technical decisions

- Keep the bubbles in memory behind the `BubbleRepository` port in `src/domain/bubble.port.ts`. The service restarts empty. A real store can replace `src/infra/bubble.repo.memory.ts` later.
- Parse the shape of each request body with zod at the route (`src/api/routes/*.schema.ts`). Keep the business rules in `src/domain/bubble.rules.ts`.
- Return a `ServiceResult` from each service function. `src/api/http.ts` maps the error codes to HTTP: `validation` 400, `not-found` 404, `conflict` 409, an unexpected error 500.
```

- [ ] **Step 4: Write `.mirror/xsrc/api/create-bubble/`**

`definition.md`:

```markdown
---
trigger: http
entry: POST /bubbles
---
Create an open bubble for an owner.
```

`steps.md`:

```markdown
1. Receive the request. `src/api/routes/bubbles.route.ts#postBubble`
2. Parse the body shape. Return HTTP 400 when it is wrong. `src/api/routes/bubbles.schema.ts#parseCreateBubbleBody`
3. Validate the title. Return HTTP 400 when it is not valid. `src/domain/bubble.rules.ts#validateTitle`
4. Make the bubble with the state `open`, a new id and the creation time. Save it. `src/domain/bubble.service.ts#createBubble`
5. Return HTTP 201 with the bubble. `src/api/http.ts#sendJson`
```

`boundary.md`:

```markdown
## Input

- `POST /bubbles` with the JSON body `{ "title": string, "ownerId": non-empty string }`.

## Output

- HTTP 201 with `{ id, title, ownerId, state: "open", createdAt, completedAt: null }`.
- HTTP 400 with `{ error: { code: "validation", field, message } }`.
- HTTP 500 with `{ error: { code: "unexpected", field: "server", message } }`.

## Dependencies

- `BubbleRepository.save` (in memory).
- `now()` and `newId()` from `src/infra/system.deps.ts`.
```

`rules.md`:

```markdown
- Create a bubble when a user supplies a title and an owner id.
- Set the state of the new bubble to `open`. Record the creation time. Give the bubble a unique id.
- Reject a title that contains no visible characters.
- Reject a title that is longer than 120 characters.

## Acceptance criteria

- Return the new bubble with the state `open`.
- Set `completedAt` to null on the new bubble.
- Store the new bubble in the repository.
- Give each bubble a different id.
- Reject an empty title.
- Reject a title that contains only whitespace.
- Accept a title of exactly 120 characters.
- Reject a title of 121 characters.
- Store nothing when the title is invalid.
```

- [ ] **Step 5: Write `.mirror/xsrc/api/complete-bubble/`**

`definition.md`:

```markdown
---
trigger: http
entry: POST /bubbles/:id/complete
---
Mark an open bubble as done.
```

`steps.md`:

```markdown
1. Receive the request. Read `id` from the path. `src/api/routes/bubbles.route.ts#postBubbleComplete`
2. Find the bubble. Return HTTP 404 when it does not exist. `src/domain/bubble.service.ts#completeBubble`
3. Make sure that the bubble is open. Return HTTP 409 when it is done. `src/domain/bubble.rules.ts#isCompletable`
4. Set the state to `done` and record the completion time. Save the bubble. `src/domain/bubble.service.ts#completeBubble`
5. Return HTTP 200 with the bubble. `src/api/http.ts#sendJson`
```

`boundary.md`:

```markdown
## Input

- `POST /bubbles/:id/complete`. No body.

## Output

- HTTP 200 with the bubble, `state: "done"` and `completedAt` set.
- HTTP 404 with `{ error: { code: "not-found", field: "id", message } }`.
- HTTP 409 with `{ error: { code: "conflict", field: "state", message } }`.
- HTTP 500 with `{ error: { code: "unexpected", field: "server", message } }`.

## Dependencies

- `BubbleRepository.findById` and `BubbleRepository.save` (in memory).
- `now()` from `src/infra/system.deps.ts`.
```

`rules.md`:

```markdown
- Set the state of a bubble to `done` when a user completes it.
- Record the completion time.
- Refuse to complete a bubble that is already done. A second completion loses the first completion time.

## Acceptance criteria

- Change the state from `open` to `done`.
- Set `completedAt` to the completion time.
- Report a not-found error for an unknown bubble id.
- Report a conflict error for a bubble that is already done.
```

- [ ] **Step 6: Write `.mirror/xsrc/api/list-owner-bubbles/`**

`definition.md`:

```markdown
---
trigger: http
entry: GET /owners/:ownerId/bubbles
---
List the bubbles of one owner, newest first.
```

`steps.md`:

```markdown
1. Receive the request. Read `ownerId` from the path. `src/api/routes/bubbles.route.ts#getBubblesByOwner`
2. Load the bubbles of the owner. `src/domain/bubble.service.ts#listBubblesByOwner`
3. Sort the bubbles newest first. `src/domain/bubble.rules.ts#sortNewestFirst`
4. Return HTTP 200 with the list. `src/api/http.ts#sendJson`
```

`boundary.md`:

```markdown
## Input

- `GET /owners/:ownerId/bubbles`.

## Output

- HTTP 200 with an array of bubbles. The array can be empty.
- HTTP 500 with `{ error: { code: "unexpected", field: "server", message } }`.

## Dependencies

- `BubbleRepository.findByOwner` (in memory).
```

`rules.md`:

```markdown
- List the bubbles of one owner.
- Show the newest bubble first.
- Exclude the bubbles of every other owner.

## Acceptance criteria

- Return only the bubbles whose `ownerId` matches the request.
- Order the bubbles by `createdAt`, newest first.
- Return an empty list for an owner who has no bubbles.
```

- [ ] **Step 7: Write `.mirror/xsrc/api/health-check/`**

`definition.md`:

```markdown
---
trigger: http
entry: GET /health
---
Tell a caller that the API runs.
```

`steps.md`:

```markdown
1. Return HTTP 200 with `{ "status": "ok" }`. `src/api/server.ts#createServer`
```

`boundary.md`:

```markdown
## Input

- `GET /health`.

## Output

- HTTP 200 with `{ "status": "ok" }`.

## Dependencies

- None.
```

`rules.md`:

```markdown
- Answer without a call to the repository.

## Acceptance criteria

- `GET /health` returns HTTP 200 with `{ "status": "ok" }`.
```

- [ ] **Step 8: Build `.mirror/visualize.html`**

Follow "Build the data" and "Write the page" in `references/build-visualize.md`, with
`${CLAUDE_PLUGIN_ROOT}` = the repository root. Title: `mirror`.

Run: `node templates/visualize.check.mjs .mirror/visualize.html`
Expected: `ok`.

Run: `node -e "const h=require('fs').readFileSync('.mirror/visualize.html','utf8');const d=JSON.parse(h.match(/id=\"mirror-data\">([\s\S]*?)<\/script>/)[1]);console.log(d.projects[0].flows.map(f=>f.id+':'+f.steps.length).join(' '))"`
Expected: `complete-bubble:5 create-bubble:5 health-check:1 list-owner-bubbles:4`

- [ ] **Step 9: Rewrite `README.md`**

````markdown
# Mirror

A Claude Code plugin. Mirror keeps the intent of each flow and page next to the code, and
draws it as a graph in one HTML file.

- `.mirror/xsrc/<project>/` holds one folder per flow (backend, worker, consumer) or page
  (frontend, Expo), with `definition.md`, `steps.md`, `boundary.md`, `rules.md`.
- `.mirror/visualize.html` draws them. `.mirror/visualize.md` sets its colors and sizes.

## Install

```sh
/plugin marketplace add aydinfurkan/mirror
/plugin install mirror@mirror
```

## Skills

- `mirror:init`: find the projects and the flows, write the documents, draw the graph.
- `mirror:add-feature`: change the flow documents, show a review page, then change the code.

## This repository

- `skills/`, `templates/`, `references/`, `.claude-plugin/`: the plugin.
- `code/`: a demo API. `.mirror/`: its mirror.
- `node templates/visualize.check.mjs [page.html]`: check the viewer or a built page.
````

Before you write the install lines, run `git remote get-url origin`. Use the real
`<owner>/<repo>` in `/plugin marketplace add`.

- [ ] **Step 10: Verify and commit**

Run: `npm -C code run test`
Expected: all tests pass.

Run: `node templates/visualize.check.mjs`
Expected: `ok`.

```bash
git add -A .mirror .gitignore README.md
git commit -m "refactor: migrate this repository to flow mirrors"
```

---

### Task 6: Manual acceptance

No files kept. Do each check in a scratch copy, not in the repository.

- [ ] **Step 1: Viewer in a browser**

Open `.mirror/visualize.html`. Check: 1 project box, 4 flow boxes, 15 step boxes, curved
edges. Click `create-bubble`: the side panel shows Definition, Boundary and Rules. Click a
step: the panel shows its code reference.

- [ ] **Step 2: Review page look**

Copy `.mirror/visualize.html` to the scratchpad. In the copy, set `"status":"added"` on
`health-check` and `"status":"removed"` on one step. Open it. Check: legend shows, green
border on `health-check`, dashed red border on the step.

- [ ] **Step 3: Skills end to end (with the user)**

Install the plugin from the local folder (`/plugin marketplace add <repo path>`, then
`/plugin install mirror@mirror`). Copy `code/` to a scratch folder with `git init`. Run
`mirror:init` there and compare the result with `.mirror/xsrc/api/`. Then run
`mirror:add-feature` for "delete a bubble" and check the review page, the tests, and the
rebuilt `visualize.html`.
