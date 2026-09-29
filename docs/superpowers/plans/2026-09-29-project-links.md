# Project Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a mirror define links between flows, projects and external systems, show them in the viewer, and use them in the change workflow.

**Architecture:** Links are bullets in the `## Dependencies` section of each `boundary.md`. External systems are declared in `config.json` and copied to the built data as `external`. The viewer (`visualize.html`) parses the links from each flow's `boundary` text, derives incoming links and project lines, and draws a new System tab, link chips on flow cards, and a Links drawer tab. The docs (rules, BUILD, WORKFLOW, AGENTS, init skill) teach Claude the format.

**Tech Stack:** One self-contained HTML page with ES5-style JS (no build step, no dependencies). Tests: `node plugin/templates/visualize.check.mjs` (Node `assert`, `vm`). Docs are Markdown in ASD-STE100 Simplified Technical English.

**Spec:** `docs/superpowers/specs/2026-09-29-project-links-design.md`

## Global Constraints

- Viewer JS stays ES5 style: `var`, `function`, no arrow functions, no `let`/`const`, no modules. Match the code around it.
- Pure logic goes above `globalThis.MirrorViewer = …` and is exported there. Browser code goes below `if (typeof document === 'undefined') return;`.
- Link verbs, exactly: `calls`, `publishes`, `consumes`, `reads`, `writes`.
- External kinds, exactly: `database`, `queue`, `cache`, `storage`, `api`, `service`.
- Link grammar: `- <verb> \`<target>\`[: <note>]`. Target: `<project>/<flow>`, `<project>`, or an external id.
- Keys: a flow is `<project>/<flow>`, a project is `<project>`, an external is `ext:<id>`.
- Docs: ASD-STE100 Simplified Technical English, one imperative instruction per sentence.
- Each change to a file in `plugin/templates/` is copied to the same path in `examples/posts/.mirror/` (they are identical today).
- `visualize.check.mjs` must print `ok` for `plugin/templates/visualize.html` and `examples/posts/.mirror/visualize.html`.
- Objects returned from the vm context are compared with `plain(x)` (JSON round trip) or `Array.from`, because `assert.deepEqual` fails on cross-realm prototypes.

## Review Focus

1. Data built before this feature (no `external`, flows without `boundary`), and the "old data" of a review page → no crash, no lines, no chips. Test in Task 1.
2. Boundary files with Windows line ends (`\r\n`) → links parse the same. Test in Task 1.
3. A link inside one project (`api/create` calls `api/other`) → chips on both cards, but no System line from `api` to `api`. Tests in Task 1 and Task 2.
4. A project that keeps its own older `.mirror/visualize.md` without `--external` → external cards still get a color. Test in Task 2.
5. Old bookmarks `visualize.html#web` still open the `web` tab; an empty or unknown hash opens System. Test in Task 2.

---

### Task 1: Link logic in the viewer

**Files:**
- Modify: `plugin/templates/visualize.html` (pure logic block, lines ~350–356)
- Test: `plugin/templates/visualize.check.mjs`

**Interfaces:**
- Produces (exported on `MirrorViewer`):
  - `parseLinks(md: string) → Array<{verb, to, note} | {bad: true, text}>`
  - `linkIndex(data) → { out: {[flowKey]: Array<{verb, to, note, key}>}, into: {[targetKey]: Array<{from, verb, note}>} }`
  - `systemEdges(data) → Array<{from: projectId, to: projectId | 'ext:'+id, status: null|'added'|'removed', label: string}>`
  - `linkErrors(data) → string[]`
  - `VERBS` (internal array, not exported)

- [ ] **Step 1: Write the failing tests**

In `plugin/templates/visualize.check.mjs`, change the destructure line to:

```js
const { groups, renderMd, summary, model, cardHtml, matches, hasChanges, parseLinks, linkIndex, systemEdges, linkErrors } = ctx.MirrorViewer;
const plain = (x) => JSON.parse(JSON.stringify(x));

// The links of the page under check must be valid.
assert.ok(data.external === undefined || Array.isArray(data.external), 'data.external must be an array');
assert.equal(linkErrors(data).join('\n'), '', 'link errors');
```

Then add before `console.log('ok');`:

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node plugin/templates/visualize.check.mjs`
Expected: FAIL with `TypeError: linkErrors is not a function`.

- [ ] **Step 3: Write the implementation**

In `plugin/templates/visualize.html`, insert after the `tabText` function (before `globalThis.MirrorViewer = …`):

```js
  var VERBS = ['calls', 'publishes', 'consumes', 'reads', 'writes'];
  var LINK = /^\s*[-*]\s+(\w+)\s+`([^`]+)`\s*(?::\s*(.*?))?\s*$/;

  // The links in the `## Dependencies` section of a boundary text. A bullet that starts with a
  // verb and has a backtick but does not match the link form is `bad`. Other bullets are notes.
  function parseLinks(md) {
    var out = [], on = false;
    String(md || '').split(/\r?\n/).forEach(function (line) {
      if (/^#{1,6}\s/.test(line)) { on = /^##\s+Dependencies\s*$/i.test(line); return; }
      if (!on || !/^\s*[-*]\s/.test(line)) return;
      var first = (/^\s*[-*]\s+(\w+)/.exec(line) || [])[1];
      if (VERBS.indexOf(String(first).toLowerCase()) < 0) return;
      var m = LINK.exec(line);
      if (m) out.push({ verb: m[1].toLowerCase(), to: m[2].trim(), note: m[3] || '' });
      else if (line.indexOf('`') >= 0) out.push({ bad: true, text: line.trim() });
    });
    return out;
  }

  function extIds(data) {
    var ext = {};
    (data.external || []).forEach(function (x) { ext[x.id] = 1; });
    return ext;
  }

  // Each flow's outgoing links, and each target's incoming links. Keys: `p/f`, `p`, `ext:<id>`.
  function linkIndex(data) {
    var ext = extIds(data), out = {}, into = {};
    (data.projects || []).forEach(function (p) {
      (p.flows || []).forEach(function (f) {
        var from = p.id + '/' + f.id;
        out[from] = parseLinks(f.boundary).filter(function (l) { return !l.bad; }).map(function (l) {
          var key = ext[l.to] ? 'ext:' + l.to : l.to;
          (into[key] = into[key] || []).push({ from: from, verb: l.verb, note: l.note });
          return { verb: l.verb, to: l.to, note: l.note, key: key };
        });
      });
    });
    return { out: out, into: into };
  }

  // The lines of the System tab: one per project pair or project-external pair, counted by verb.
  // A line only in the new links is `added`. A line only in the old links (`old.boundary`) is `removed`.
  function systemEdges(data) {
    var ext = extIds(data), pids = {}, edges = [], by = {};
    (data.projects || []).forEach(function (p) { pids[p.id] = 1; });
    function add(side, from, l) {
      if (l.bad) return;
      var to = ext[l.to] ? 'ext:' + l.to : l.to.split('/')[0];
      if (to === from || !(ext[l.to] || pids[to])) return;
      var e = by[from + '>' + to];
      if (!e) edges.push(e = by[from + '>' + to] = { from: from, to: to, old: {}, now: {} });
      e[side][l.verb] = (e[side][l.verb] || 0) + 1;
    }
    (data.projects || []).forEach(function (p) {
      (p.flows || []).forEach(function (f) {
        var old = f.old && f.old.boundary !== undefined ? f.old.boundary : f.boundary;
        if (f.status !== 'added') parseLinks(old).forEach(function (l) { add('old', p.id, l); });
        if (f.status !== 'removed') parseLinks(f.boundary).forEach(function (l) { add('now', p.id, l); });
      });
    });
    return edges.map(function (e) {
      var had = Object.keys(e.old).length > 0, has = Object.keys(e.now).length > 0, c = has ? e.now : e.old;
      return { from: e.from, to: e.to, status: had && has ? null : has ? 'added' : 'removed',
        label: VERBS.filter(function (v) { return c[v]; }).map(function (v) { return c[v] + ' ' + v; }).join(' · ') };
    });
  }

  // Problems in the links: an external with a project id, a bad bullet, an unknown target.
  function linkErrors(data) {
    var ids = {}, errs = [];
    (data.projects || []).forEach(function (p) {
      ids[p.id] = 1;
      (p.flows || []).forEach(function (f) { if (f.status !== 'removed') ids[p.id + '/' + f.id] = 1; });
    });
    (data.external || []).forEach(function (x) {
      if (ids[x.id]) errs.push('external `' + x.id + '` has the id of a project');
      else ids[x.id] = 1;
    });
    (data.projects || []).forEach(function (p) {
      (p.flows || []).forEach(function (f) {
        if (f.status === 'removed') return;
        var at = p.id + '/' + f.id + ': ';
        parseLinks(f.boundary).forEach(function (l) {
          if (l.bad) errs.push(at + 'write the link as "- <verb> `<target>`: <note>": ' + l.text);
          else if (!ids[l.to]) errs.push(at + 'unknown target `' + l.to + '`');
        });
      });
    });
    return errs;
  }
```

Note: in `bad`, `ids.api` is already set by the project, so the external `api` is reported and not added. Its link targets resolve against the project id.

Change the export line to:

```js
  globalThis.MirrorViewer = { esc: esc, renderMd: renderMd, summary: summary, model: model, groups: groups, cardHtml: cardHtml, matches: matches, hasChanges: hasChanges, diffHtml: diffHtml,
    parseLinks: parseLinks, linkIndex: linkIndex, systemEdges: systemEdges, linkErrors: linkErrors };
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node plugin/templates/visualize.check.mjs`
Expected: `ok`

- [ ] **Step 5: Commit**

```bash
git add plugin/templates/visualize.html plugin/templates/visualize.check.mjs
git commit -m "feat(viewer): parse links from boundary Dependencies"
```

---

### Task 2: Viewer UI — chips, Links tab, System tab

**Files:**
- Modify: `plugin/templates/visualize.html` (CSS, `model`, `cardHtml`, new `systemModel`, `tabFromHash`, and the browser block)
- Modify: `plugin/templates/visualize.md` (token block + table)
- Test: `plugin/templates/visualize.check.mjs`

**Interfaces:**
- Consumes: `linkIndex`, `systemEdges`, `parseLinks` from Task 1.
- Produces (exported on `MirrorViewer`):
  - `model(p, idx?)`: when `idx` (from `linkIndex`) is given, each flow node gets `out` (outgoing links) and `into` (incoming links).
  - `systemModel(data, idx) → { projects: node[], externals: node[], all: node[], edges: systemEdges(data) }`. External nodes: `{ key: 'ext:'+id, type: 'external', label: id, sub: name, badge: KIND, out: [], into: [...] }`.
  - `tabFromHash(hash: string, projects) → -1 | projectIndex` (`-1` is System).

- [ ] **Step 1: Write the failing tests**

Change the destructure line in `visualize.check.mjs` to also take `systemModel, tabFromHash`:

```js
const { groups, renderMd, summary, model, cardHtml, matches, hasChanges, parseLinks, linkIndex, systemEdges, linkErrors, systemModel, tabFromHash } = ctx.MirrorViewer;
```

Add before `console.log('ok');` (after the Task 1 tests, so `sys`, `idx`, `m` exist):

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node plugin/templates/visualize.check.mjs`
Expected: FAIL (`systemModel is not a function` or the `lchips` match fails).

- [ ] **Step 3: Add the token and the CSS**

In the `:root` token block of `plugin/templates/visualize.html` and of the `css` fence in `plugin/templates/visualize.md`, change the card color line:

```css
  --project: #09090b;  --flow: #2563eb;  --page: #d97706;  --step: #71717a;  --group: #3f3f46;  --external: #7c3aed;
```

In `:root[data-theme="dark"]` (both files):

```css
  --project: #fafafa;  --flow: #60a5fa;  --page: #fbbf24;  --step: #71717a;  --group: #52525b;  --external: #a78bfa;
```

In the token table of `visualize.md`, add a row after the `--group` row:

```md
| `--external` | Border and badge color of an external system card on the System tab: a database, a queue, or an API outside the repo. |
```

And change the `--edge` row to: `| \`--edge\` | Lines between cards. On the System tab, the lines between projects and external systems. |`

In the style block of `visualize.html`, after `.card.page { --c: var(--page); }`, add:

```css
.card.external { --c: var(--external, #7c3aed); }
.lchips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.lchip { max-width: 100%; padding: 1px 8px; border: 1px solid var(--border); border-radius: 999px; background: var(--bg); font: 14px var(--mono); color: var(--muted); text-align: left; overflow-wrap: anywhere; cursor: pointer; }
.lchip:hover, .lchip:focus-visible { color: var(--text); border-color: var(--accent); outline: none; }
.row.system { gap: calc(var(--gap-x) * 3); }
.row.system.top { margin-top: 110px; }
.row.system + .row.system { margin-top: calc(var(--gap-y) * 2); }
.edge.st-added { stroke: var(--added); stroke-width: 2.5; }
.edge.st-removed { stroke: var(--removed); stroke-width: 2.5; stroke-dasharray: 6 4; }
.arrow { fill: var(--edge); }
.elabel { font: 14px var(--font); fill: var(--muted); paint-order: stroke; stroke: var(--bg); stroke-width: 4px; }
```

- [ ] **Step 4: Pure logic — model, cards, System model, hash**

Replace `model` and add `projectNode` above it:

```js
  function projectNode(p) {
    return { key: p.id, type: 'project', title: p.id, label: p.id, sub: (p.kind || ''),
      badge: 'PROJECT', status: p.status || null, item: p };
  }

  // One project as cards: the project, its flows, and the steps inside each flow.
  // idx (from linkIndex) adds the outgoing and incoming links of each flow.
  function model(p, idx) {
    var pn = projectNode(p);
    var all = [pn];
    var flows = (p.flows || []).map(function (f) {
      var key = p.id + '/' + f.id;
      var fn = { key: key, type: f.kind === 'page' ? 'page' : 'flow', title: f.id, label: f.id, sub: f.entry || '',
        badge: BADGE[f.trigger] || '', status: f.status || null, item: f };
      if (idx) { fn.out = idx.out[key] || []; fn.into = idx.into[key] || []; }
      all.push(fn);
      fn.steps = (f.steps || []).map(function (s, i) {
        var sn = { key: key + '#' + i, type: 'step', title: s.n + '. ' + s.text, label: s.title || s.text, num: s.n, sub: s.ref || '',
          status: s.status || null, item: s, parent: f, parentKey: key };
        all.push(sn);
        return sn;
      });
      return fn;
    });
    return { project: pn, flows: flows, groups: groups(flows), all: all };
  }
```

Add after `groups`:

```js
  // The System tab as cards: each project, then each external system.
  function systemModel(data, idx) {
    var projects = (data.projects || []).map(projectNode);
    var externals = (data.external || []).map(function (x) {
      var key = 'ext:' + x.id;
      return { key: key, type: 'external', title: x.id, label: x.id, sub: x.name || '', badge: String(x.kind || '').toUpperCase(),
        status: null, item: x, out: [], into: idx.into[key] || [] };
    });
    return { projects: projects, externals: externals, all: projects.concat(externals), edges: systemEdges(data) };
  }

  // The tab of a URL hash: the index of the project it names, or -1 for the System tab.
  function tabFromHash(hash, projects) {
    var id;
    try { id = decodeURIComponent(String(hash || '').slice(1)); } catch (e) { return -1; }
    return (projects || []).map(function (p) { return p.id; }).indexOf(id);
  }
```

In `cardHtml`, after the `if (def) …` line, add:

```js
    // Link chips. An external card on the System tab shows none: its lines show the links.
    var seen = {}, chips = [];
    function chip(key, text, verb) {
      if (seen[text]) return;
      seen[text] = 1;
      chips.push('<button type="button" class="lchip" data-goto="' + esc(key) + '" title="' + esc(verb) + '">' + esc(text) + '</button>');
    }
    if (n.type !== 'external') {
      (n.out || []).forEach(function (l) { chip(l.key, '→ ' + l.to, l.verb); });
      (n.into || []).forEach(function (l) { chip(l.from, '← ' + l.from, l.verb); });
    }
    if (chips.length) h += '<div class="lchips">' + chips.join('') + '</div>';
```

Add `systemModel: systemModel, tabFromHash: tabFromHash` to the `globalThis.MirrorViewer` export.

- [ ] **Step 5: Run the test to verify it passes**

Run: `node plugin/templates/visualize.check.mjs`
Expected: `ok`

- [ ] **Step 6: Browser code — tabs, draw, goto, drawer**

All edits are below `if (typeof document === 'undefined') return;`. `state.pi === -1` is the System tab.

a) `renderTabs`: replace with

```js
  function renderTabs() {
    var projects = state.data.projects || [];
    function tab(i, label, kind, dot) {
      var on = i === state.pi;
      return '<button class="ptab' + (on ? ' on' : '') + '" role="tab" aria-selected="' + on + '" tabindex="' + (on ? 0 : -1) +
        '" data-pi="' + i + '">' + esc(label) + (kind ? ' <small>' + esc(kind) + '</small>' : '') +
        (dot ? '<span class="dot" title="Has changes"></span>' : '') + '</button>';
    }
    $('ptabs').innerHTML = !projects.length ? '' :
      tab(-1, 'System', '', state.sys.edges.some(function (e) { return STATUS[e.status]; })) +
      projects.map(function (p, i) { return tab(i, p.id, p.kind || '', hasChanges(p)); }).join('');
  }
```

b) Add after `drawEdges`:

```js
  // Project cards sit in the top row and external cards in the row below. A line between two
  // projects arcs above the top row. A line to an external goes down. Each line has its label.
  function drawSystemEdges(edges) {
    var w = state.world, svg = w.querySelector('.edges');
    svg.setAttribute('width', w.offsetWidth);
    svg.setAttribute('height', w.offsetHeight);
    edges.forEach(function (e, i) {
      var ea = nodeEl(e.from), eb = nodeEl(e.to);
      if (!ea || !eb) return;
      var a = box(ea), b = box(eb), ax = a.x + a.w / 2, bx = b.x + b.w / 2, d, ly;
      if (e.to.indexOf('ext:') === 0) {
        var y1 = a.y + a.h, y2 = b.y, my = (y1 + y2) / 2;
        d = 'M' + ax + ' ' + y1 + ' C' + ax + ' ' + my + ' ' + bx + ' ' + my + ' ' + bx + ' ' + y2;
        ly = my;
      } else {
        var y = a.y, top = y - 40 - 24 * (i % 3);
        d = 'M' + ax + ' ' + y + ' C' + ax + ' ' + top + ' ' + bx + ' ' + top + ' ' + bx + ' ' + y;
        ly = 0.25 * y + 0.75 * top;
      }
      var path = document.createElementNS(SVG, 'path');
      path.setAttribute('class', 'edge' + (STATUS[e.status] ? ' st-' + e.status : ''));
      path.setAttribute('d', d);
      path.setAttribute('marker-end', 'url(#arrow)');
      svg.appendChild(path);
      var t = document.createElementNS(SVG, 'text');
      t.setAttribute('class', 'elabel');
      t.setAttribute('x', (ax + bx) / 2);
      t.setAttribute('y', ly - 4);
      t.setAttribute('text-anchor', 'middle');
      t.textContent = e.label;
      svg.appendChild(t);
    });
  }
```

c) `currentProject`: keep as is (it returns `null` for index -1).

d) `draw`: replace with

```js
  function draw() {
    var w = state.world, sys = state.pi < 0;
    if (!(state.data.projects || []).length) {
      state.m = null;
      state.byKey = {};
      w.innerHTML = '<p class="empty-state">No projects yet. Run mirror:init.</p>';
      return;
    }
    var m = state.m = sys ? state.sys : model(currentProject(), state.links);
    state.byKey = {};
    m.all.forEach(function (n) { state.byKey[n.key] = n; });
    state.hits = m.all.filter(function (n) { return matches(n, state.q); });
    if (state.hit >= state.hits.length) state.hit = state.hits.length - 1;
    if (sys) {
      w.innerHTML = '<svg class="edges" aria-hidden="true"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" ' +
        'markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="arrow" d="M0 0L10 5L0 10z"/></marker></defs></svg>' +
        '<div class="row system top">' + m.projects.map(function (n) { return cardHtml(n); }).join('') + '</div>' +
        (m.externals.length ? '<div class="row system">' + m.externals.map(function (n) { return cardHtml(n); }).join('') + '</div>' : '');
    } else {
      w.innerHTML = '<svg class="edges" aria-hidden="true"></svg><div class="row">' + cardHtml(m.project) + '</div>' +
        (m.flows.length ? '<div class="row groups">' + m.groups.map(function (g) {
          return '<div class="group" role="group" aria-label="' + esc(g.name || 'flows') + '">' +
            (g.name ? '<div class="gh">' + esc(g.name) + ' <small>' + g.flows.length + '</small></div>' : '') +
            '<div class="gflows">' + g.flows.map(function (f) { return cardHtml(f, state.expanded[f.key]); }).join('') + '</div></div>';
        }).join('') + '</div>' : '');
    }
    state.hits.forEach(function (n, i) {
      var e = nodeEl(n.key);
      if (e) e.classList.add('match', i === state.hit ? 'current' : 'match');
    });
    var s = state.sel && nodeEl(state.sel);
    if (s) s.classList.add('sel');
    if (sys) drawSystemEdges(m.edges); else drawEdges();
    $('qcount').textContent = state.q.trim() ? (state.hits.length ? (state.hit + 1) + '/' + state.hits.length : '0') : '';
    $('legend').classList.toggle('on', m.all.some(function (n) { return STATUS[n.status]; }) ||
      (m.edges || []).some(function (e) { return STATUS[e.status]; }));
  }
```

e) `setAll`: `state.m.flows` does not exist on the System tab. Change both `state.m` guards to `state.m && state.m.flows`.

f) `search`: it already guards on `p` (null on System). No change.

g) Add after `goto`'s definition, and change `goto`:

```js
  function projectIndex(id) {
    return (state.data.projects || []).map(function (p) { return p.id; }).indexOf(id);
  }

  // The tab that shows a key: a flow or a step in its project; a bare project or an external on System.
  function tabOf(key) {
    return key.indexOf('ext:') === 0 || key.indexOf('/') < 0 ? -1 : projectIndex(key.split('/')[0]);
  }

  function goto(key) {
    var t = tabOf(key);
    if (t !== state.pi) switchProject(t, false);
    var n = state.byKey[key];
    if (n && n.type === 'step' && !state.expanded[n.parentKey]) {
      state.expanded[n.parentKey] = true;
      draw();
    }
    select(key, true);
  }
```

h) `switchProject`: change the bounds check and the hash line:

```js
    if (i < -1 || i >= projects.length) return;
    …
    try { history.replaceState(null, '', i < 0 ? location.pathname + location.search : '#' + encodeURIComponent(projects[i].id)); } catch (e) { /* file:// in some browsers */ }
```

i) `projectFromHash`: replace the body with `return tabFromHash(location.hash, state.data.projects);`.

j) `activate`: replace with

```js
  function activate(target) {
    var g = target.closest('[data-goto]');
    if (g) { goto(g.getAttribute('data-goto')); return true; }
    var tg = target.closest('[data-toggle]');
    if (tg) { toggleFlow(tg.getAttribute('data-toggle')); return true; }
    var node = target.closest('[data-key]');
    if (!node) return false;
    var key = node.getAttribute('data-key'), n = state.byKey[key];
    if (state.pi < 0 && n && n.type === 'project') switchProject(projectIndex(key), false);
    else select(key, false);
    return true;
  }
```

k) Drawer. Add before `body`:

```js
  function linkList(items) {
    return items.length ? '<ul class="list">' + items.map(function (x) {
      return '<li><div><span class="meta">' + esc(x.verb) + '</span> <button class="link" data-goto="' + esc(x.key) + '">' + esc(x.text) + '</button>' +
        (x.note ? '<div class="meta">' + inline(x.note) + '</div>' : '') + '</div></li>';
    }).join('') + '</ul>' : '<p class="empty">None.</p>';
  }
```

In `body`, add before the `// A changed item keeps its old values` comment:

```js
    if (tab === 'links') {
      var used = '<h5>Used by</h5>' + linkList((n.into || []).map(function (l) { return { key: l.from, text: l.from, verb: l.verb, note: l.note }; }));
      if (n.type === 'external') return used;
      return '<h5>Uses</h5>' + linkList((n.out || []).map(function (l) { return { key: l.key, text: l.to, verb: l.verb, note: l.note }; })) + used;
    }
```

In `openDrawer`, change the `tabs` line to:

```js
    var tabs = n.type === 'project' ? ['definition', 'flows'] : n.type === 'step' ? [] : n.type === 'external' ? ['links'] :
      ['definition', 'steps', 'boundary', 'links', 'rules'];
```

l) `main`: after `state.world = $('world');`, add:

```js
    state.links = linkIndex(state.data);
    state.sys = systemModel(state.data, state.links);
```

Also the `ptabs` keydown: `switchProject(state.pi - 1, true)` now reaches `-1` (System). No change needed.

- [ ] **Step 7: Run the check**

Run: `node plugin/templates/visualize.check.mjs`
Expected: `ok`

- [ ] **Step 8: Try it in a browser**

Build a throwaway page from the example with the new template (Task 4 has the real rebuild):

```bash
node -e "const fs=require('fs');const src=fs.readFileSync('examples/posts/.mirror/visualize.html','utf8');const d=src.match(/<script type=\"application\/json\" id=\"mirror-data\">([\s\S]*?)<\/script>/)[1];const t=fs.readFileSync('plugin/templates/visualize.html','utf8');fs.writeFileSync(process.env.TEMP+'/mirror-try.html',t.replace(/(<script type=\"application\/json\" id=\"mirror-data\">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+d+b))"
```

Open `%TEMP%/mirror-try.html` (`start "" "%TEMP%\mirror-try.html"` on Windows). Check:
- The page opens on the System tab. It shows the `api` and `web` cards (no lines yet, because the example links are not in the new format until Task 4).
- The `api` and `web` tabs work as before. `#web` in the URL opens `web`.
- Arrow keys move between the tabs, including System.
- The browser console has no errors.

- [ ] **Step 9: Commit**

```bash
git add plugin/templates/visualize.html plugin/templates/visualize.md plugin/templates/visualize.check.mjs
git commit -m "feat(viewer): System tab, link chips and Links drawer tab"
```

---

### Task 3: Docs — rules, build, workflow, agents, init

**Files:**
- Modify: `plugin/templates/rules/boundary.md`
- Modify: `plugin/templates/rules/examples/boundary-rest.md`
- Modify: `plugin/templates/rules/examples/boundary-consumer.md`
- Modify: `plugin/templates/BUILD.md`
- Modify: `plugin/templates/WORKFLOW.md`
- Modify: `plugin/templates/AGENTS.md`
- Modify: `plugin/skills/init/SKILL.md`
- Modify: `plugin/.claude-plugin/plugin.json` (version `0.2.0` → `0.3.0`)

**Interfaces:**
- Consumes: the grammar and the verbs from Global Constraints; `linkErrors` messages from Task 1 (the check prints them).
- Produces: `config.json` `external` shape `{ "<id>": { "kind": "<kind>", "name": "<text>" } }`; data field `external: [{ id, kind, name }]`.

- [ ] **Step 1: `rules/boundary.md`**

Replace the `- \`## Dependencies\`: …` bullet with:

```md
- `## Dependencies`: one bullet per link to another flow, project or external system. Write
  other needs (a helper, a repository in memory) as plain bullets. See "Links".
```

Add this section before `## Example blocks`:

````md
## Links

Write each link as one bullet:

```md
- calls `api/create-post`: sends the form values.
- writes `posts-db`: saves the post.
- publishes `post-events`
```

- Start the bullet with one verb: `calls`, `publishes`, `consumes`, `reads` or `writes`.
- Put the target in backticks: `<project>/<flow>`, `<project>` when the flow is not known, or the
  id of an external system in `config.json`.
- Add `: <note>` to tell why. The note is optional.
- Do not add text after the backticks without `: `. The check fails on `- reads \`db\` (in memory).`
- Add each database, queue, cache, storage or API outside the repository to `external` in
  `.mirror/config.json` before you link to it:

```json
"external": {
  "posts-db": { "kind": "database", "name": "Postgres" },
  "post-events": { "kind": "queue", "name": "Kafka topic post.events" }
}
```

- Use one of these kinds: `database`, `queue`, `cache`, `storage`, `api`, `service`.
- Do not give an external system the id of a project.
- A bullet that does not start with a verb is a plain note. The viewer does not draw it.
````

In the `## Pages` section, change the last bullet to:

```md
- The Dependencies list a `calls` link to each API flow that the page calls.
```

- [ ] **Step 2: Rule examples**

`rules/examples/boundary-rest.md`: replace `- \`UserRepository.save\`` with

```md
- writes `users-db`: saves the user with `UserRepository.save`.
```

`rules/examples/boundary-consumer.md`: replace `- Topic \`welcome-email.requested\`.` with

```md
- consumes `user-created`: the message that starts this flow.
- publishes `welcome-email-requested`: when the message is valid.
```

- [ ] **Step 3: `BUILD.md`**

In "Build the data", add a step after step 1 (renumber the rest):

```md
2. Make one external entry for each key in `external` of `config.json`. Keep the key order.
   Use `[]` when `external` does not exist.
   - `id`: the key.
   - `kind`, `name`: the values from `config.json`.
```

In the shape block, add `"external": [{ "id": "users-db", "kind": "database", "name": "Postgres" }],` after `"title": "my-repo",`.

After the shape block, add:

```md
The data holds no links. The page reads them from the `## Dependencies` section of each
`boundary`. It also finds the incoming links and the lines between projects.
```

In "Write the page", step 4, append: `When it prints a link error, fix the \`boundary.md\` or the \`external\` map in \`config.json\`. Build the page again.`

- [ ] **Step 4: `WORKFLOW.md`**

In "## 1. Understand", after item 3, add:

```md
4. For each flow or page in the list, find the affected flows:
   - each flow with a link to it or to its project;
   - for each external system that it `publishes` to or `writes`, each flow that `consumes` or
     `reads` that external system.
   Show them to the user as "Affected".
```

In "## 2. Change the mirror", after item 2, add:

```md
3. When the change breaks a contract of a flow (it removes a field, adds a required field, or
   changes a status code or an event shape), edit the files of each affected flow too.
```

Renumber the items after it.

In "## 4. Code", change item 4 to:

```md
4. Run the full test suite of each changed project and of each project with an affected flow.
   Make sure that all tests pass.
```

- [ ] **Step 5: `AGENTS.md`**

Change the `config.json` layout bullet to:

```md
- `.mirror/config.json`: the projects, the root folder and the kind of each project, and the
  external systems (databases, queues, APIs outside the repository).
```

- [ ] **Step 6: `init` skill**

In `plugin/skills/init/SKILL.md`, "## 1. Find the projects": after item 3, add:

```md
4. Find the external systems: databases, queues and topics, caches, file storage, and APIs
   outside the repository. Read the DB and queue clients and the SDKs in the manifests, the env
   files, `docker-compose.yml` and the config files. Give each one a kebab-case id and one kind:
   `database`, `queue`, `cache`, `storage`, `api` or `service`. Do not use the id of a project.
```

Change the old item 4 to `5. Show the projects and the external systems to the user as two tables. Wait for an OK. Apply the changes the user asks for.` and item 5 to `6. Write .mirror/config.json:` with this example:

```json
{ "projects": {
  "web-backend": { "root": "apps/web", "kind": "backend" },
  "web-frontend": { "root": "apps/web", "kind": "frontend" }
}, "external": {
  "app-db": { "kind": "database", "name": "Postgres" }
} }
```

In "## 3. Write the documents", add an item after item 3:

```md
4. Write the links in `## Dependencies` of `boundary.md` with the "Links" rule. For each API
   call of a page, find the backend flow with the same method and path. Link to that flow.
   Link to each external system that the flow uses.
```

Renumber the item after it. In "## 5. Draw", item 3, append: `Fix each link error that it prints.`

- [ ] **Step 7: Version**

In `plugin/.claude-plugin/plugin.json`, set `"version": "0.3.0"`.

- [ ] **Step 8: Verify**

Run: `node plugin/templates/visualize.check.mjs`
Expected: `ok`

Run: `git grep -n "Dependencies" plugin/`
Expected: each hit uses the new wording; none says "a bullet list of databases, queues, external APIs, and other flows".

- [ ] **Step 9: Commit**

```bash
git add plugin/
git commit -m "docs: teach the link format, external systems and affected flows"
```

---

### Task 4: Example repo

**Files:**
- Modify: `examples/posts/.mirror/config.json`
- Modify: `examples/posts/.mirror/xsrc/web/*/boundary.md` (4 files)
- Copy: templates from Tasks 2–3 into `examples/posts/.mirror/` (`AGENTS.md`, `BUILD.md`, `WORKFLOW.md`, `visualize.md`, `rules/boundary.md`, `rules/examples/boundary-rest.md`, `rules/examples/boundary-consumer.md`)
- Rebuild: `examples/posts/.mirror/visualize.html`

**Interfaces:**
- Consumes: the viewer from Tasks 1–2; the docs from Task 3.

- [ ] **Step 1: Copy the templates**

```bash
for f in AGENTS.md BUILD.md WORKFLOW.md visualize.md rules/boundary.md rules/examples/boundary-rest.md rules/examples/boundary-consumer.md; do cp plugin/templates/$f examples/posts/.mirror/$f; done
```

- [ ] **Step 2: Links in the web pages**

The api uses a repository in memory, so the example has no external system. Keep the api `## Dependencies` bullets as plain notes. Leave `config.json` without `external`.

`xsrc/web/new-post/boundary.md`, `## Dependencies`:

```md
- calls `api/create-post`: `POST /api/posts` with the form values.
```

`xsrc/web/edit-post/boundary.md`:

```md
- calls `api/get-post`: `GET /api/posts/:id` to fill the form.
- calls `api/update-post`: `PATCH /api/posts/:id` with the changed fields.
```

`xsrc/web/post-detail/boundary.md`:

```md
- calls `api/get-post`: `GET /api/posts/:id` to show the post.
- calls `api/delete-post`: `DELETE /api/posts/:id` when the user deletes the post.
```

`xsrc/web/posts-list/boundary.md`:

```md
- calls `api/list-posts`: `GET /api/posts` to show the list.
```

- [ ] **Step 3: Rebuild the page**

Write this throwaway script to the scratchpad (not the repo) as `rebuild.mjs`. It follows "Build the data" for the parts that changed (boundary text, `external`, `generated`) and "Write the page":

```js
// usage: node rebuild.mjs <mirror dir> <template>
import { readFileSync, writeFileSync } from 'node:fs';
const [dir, tpl] = process.argv.slice(2);
const DATA = /(<script type="application\/json" id="mirror-data">)([\s\S]*?)(<\/script>)/;
const data = JSON.parse(readFileSync(`${dir}/visualize.html`, 'utf8').match(DATA)[2]);
const cfg = JSON.parse(readFileSync(`${dir}/config.json`, 'utf8'));
data.external = Object.entries(cfg.external || {}).map(([id, x]) => ({ id, kind: x.kind, name: x.name }));
for (const p of data.projects) for (const f of p.flows) f.boundary = readFileSync(`${dir}/xsrc/${p.id}/${f.id}/boundary.md`, 'utf8');
data.generated = new Date().toISOString().slice(0, 10);
const tokens = readFileSync(`${dir}/visualize.md`, 'utf8').match(/```css\r?\n([\s\S]*?)```/)[1];
let out = readFileSync(tpl, 'utf8');
out = out.replace(/(\/\* MIRROR:TOKENS:START \*\/\r?\n)[\s\S]*?(\/\* MIRROR:TOKENS:END \*\/)/, (_, a, b) => a + tokens + b);
out = out.replace(DATA, (_, a, _old, b) => a + '\n' + JSON.stringify(data).replace(/</g, '\\u003c') + '\n' + b);
writeFileSync(`${dir}/visualize.html`, out);
```

Run: `node <scratchpad>/rebuild.mjs examples/posts/.mirror plugin/templates/visualize.html`

- [ ] **Step 4: Check the page**

Run: `node plugin/templates/visualize.check.mjs examples/posts/.mirror/visualize.html`
Expected: `ok`

Run: `git diff --stat examples/posts/.mirror/visualize.html`
Expected: the page changed (new app code, tokens, 4 boundary texts, `generated`). No flow or step was lost: `node -e` count of flows equals 10.

```bash
node -e "const h=require('fs').readFileSync('examples/posts/.mirror/visualize.html','utf8');const d=JSON.parse(h.match(/id=\"mirror-data\">([\s\S]*?)<\/script>/)[1]);console.log(d.projects.map(p=>p.id+':'+p.flows.length).join(' '))"
```

Expected: `api:6 web:4`

- [ ] **Step 5: Try it in a browser**

Open `examples/posts/.mirror/visualize.html`. Check:
- System tab: `web → api` with the label `6 calls`.
- `web` tab: `new-post` shows the chip `→ api/create-post`. Click it: the `api` tab opens and `create-post` is centered and selected.
- `api` tab: `get-post` shows `← web/edit-post` and `← web/post-detail`.
- Drawer of `get-post` → Links tab: "Uses: None." and "Used by" with the two pages.
- Dark theme: the lines, labels and chips are readable.
- The browser console has no errors.

- [ ] **Step 6: Commit**

```bash
git add examples/posts/.mirror
git commit -m "docs(example): links between web pages and api flows"
```

---

## Self-review notes

- Spec coverage: format + check (Task 1, Task 3), System tab / chips / drawer / review lines (Task 1 `systemEdges`, Task 2), workflow + init + BUILD + rules + AGENTS (Task 3), example repo (Task 4), tests (Tasks 1–2).
- The review page needs no BUILD change: `old.boundary` already holds the old links.
