# Page Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Describe each page (`frontend`, `expo`) as a set of actions in `actions.md` (Call / Then / Fail / Code) instead of numbered steps, and make the `Call:` lines the page's only links.

**Architecture:** BUILD turns each `## <action>` of `actions.md` into an entry of the flow's existing `steps` array and adds the raw text as `actions`. The viewer picks a flow's links from `actions` (`Call:` lines) when that field exists, else from `boundary` (`## Dependencies`), for both the new and the old (review) values. The card, the drawer and the check learn the word "action". Docs and the example repo follow.

**Tech Stack:** Self-contained `visualize.html` (ES5 JS), `node plugin/templates/visualize.check.mjs`, Markdown docs in ASD-STE100.

**Spec:** `docs/superpowers/specs/2026-09-29-page-actions-design.md` (builds on `docs/superpowers/specs/2026-09-29-project-links-design.md`)

## Global Constraints

- Work on branch `feat/project-links` (this plan builds on it).
- Viewer JS stays ES5: `var`, `function`, no arrows. Pure logic above `globalThis.MirrorViewer = …`, exported there; browser code below `if (typeof document === 'undefined') return;`.
- `Call:` grammar: ``- Call: `<target>`[: <note>]``. Target: `<project>/<flow>`, `<project>`, or an external id. Each `Call:` is a `calls` link.
- Bullet order in an action: `Call:`*, `Then:`*, `Fail:`*, then one `Code:`.
- Actions have no numbers in the UI. The toggle says `N actions` / `1 action`.
- A flow "has actions" when `typeof f.actions === 'string'`.
- Docs: ASD-STE100, one imperative instruction per sentence. Copy each template change to `examples/posts/.mirror/`.
- Compare vm objects with `plain(x)` or `Array.from` (cross-realm).
- Both checks must print `ok`: `node plugin/templates/visualize.check.mjs` and `node plugin/templates/visualize.check.mjs examples/posts/.mirror/visualize.html`.

## Review Focus

1. A review where a page moves from `steps.md` to `actions.md`: old data has no `actions`, so BUILD writes `old.actions: null`; the old links must come from `old.boundary`, and the lines must not flip to added/removed. Test in Task 1.
2. Mixed mirror: some pages with `actions.md`, some still with `steps.md` → each card uses its own word and links. Test in Task 1 and Task 2.
3. `Call:` written in other case or with a missing backtick (`- call: api/x`) → an error, not a silent skip. Test in Task 1.
4. An action with only `Code:` (no Call/Then/Fail) → valid, card and drawer render. Test in Task 2.
5. A `Call:` to an external id → chip and drawer link jump to `ext:<id>` on System. Test in Task 2 (chip key).

---

### Task 1: Links from actions

**Files:**
- Modify: `plugin/templates/visualize.html` (link logic, ~lines 410–502)
- Test: `plugin/templates/visualize.check.mjs`

**Interfaces:**
- Consumes: `parseLinks`, `linkIndex`, `systemEdges`, `linkErrors` (branch `feat/project-links`).
- Produces (exported): `parseCalls(md) → Array<{verb:'calls', to, note} | {bad:true, call:true, text}>`, `flowLinks(f, old?: boolean) → links`. `linkIndex`, `systemEdges`, `linkErrors` now use `flowLinks`.

- [ ] **Step 1: Write the failing tests**

Add `parseCalls, flowLinks` to the destructure line of `visualize.check.mjs`. Add before the `// A flow card shows its links as chips` comment:

```js
// Actions: each `Call:` bullet is a `calls` link. Other bullets are not links. A broken Call is bad.
const acts = '## Open the page\r\n- Call: `api/get`: load it.\r\n- Then: show it.\n- Fail: show an alert.\n- Code: `src/p.tsx#P`\n\n' +
  '## Click "Pay"\n- call: `stripe`\n- Call: api/x\n- Then: open `/done`.\n- Code: `src/p.tsx#pay`';
assert.deepEqual(plain(parseCalls(acts)), [
  { verb: 'calls', to: 'api/get', note: 'load it.' },
  { verb: 'calls', to: 'stripe', note: '' },
  { bad: true, call: true, text: '- Call: api/x' },
]);
assert.deepEqual(plain(parseCalls(undefined)), []);

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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node plugin/templates/visualize.check.mjs`
Expected: FAIL with `TypeError: parseCalls is not a function`.

- [ ] **Step 3: Implement**

After `parseLinks`, add:

```js
  var CALL = /^\s*[-*]\s+Call:\s*`([^`]+)`\s*(?::\s*(.*?))?\s*$/i;

  // The `Call:` bullets of an actions text, as `calls` links. A `Call:` bullet that does not match
  // the call form is `bad`. Other bullets are not links.
  function parseCalls(md) {
    var out = [];
    String(md || '').split(/\r?\n/).forEach(function (line) {
      if (!/^\s*[-*]\s+Call:/i.test(line)) return;
      var m = CALL.exec(line);
      out.push(m ? { verb: 'calls', to: m[1].trim(), note: m[2] || '' } : { bad: true, call: true, text: line.trim() });
    });
    return out;
  }

  // The links of a flow: the `Call:` lines of its actions when it has actions, else the
  // Dependencies of its boundary. old: use the values before a review change. `old.actions: null`
  // means the old flow had no actions.
  function flowLinks(f, old) {
    var o = old && f.old ? f.old : {};
    var actions = 'actions' in o ? o.actions : f.actions;
    var boundary = 'boundary' in o ? o.boundary : f.boundary;
    return typeof actions === 'string' ? parseCalls(actions) : parseLinks(boundary);
  }
```

In `linkIndex`, change `parseLinks(f.boundary)` to `flowLinks(f)`.

In `systemEdges`, replace the three lines inside the flow loop with:

```js
        if (f.status !== 'added') flowLinks(f, true).forEach(function (l) { add('old', p.id, l); });
        if (f.status !== 'removed') flowLinks(f).forEach(function (l) { add('now', p.id, l); });
```

In `linkErrors`, replace the `parseLinks(f.boundary).forEach(…)` block with:

```js
        flowLinks(f).forEach(function (l) {
          if (l.bad && l.call) errs.push(at + 'write the call as "- Call: `<target>`: <note>": ' + l.text);
          else if (l.bad) errs.push(at + 'write the link as "- <verb> `<target>`: <note>": ' + l.text);
          else if (!ids[l.to]) errs.push(at + 'unknown target `' + l.to + '`');
        });
        if (typeof f.actions === 'string' && parseLinks(f.boundary).length) {
          errs.push(at + 'move the links of boundary.md to `Call:` lines in actions.md');
        }
```

Add `parseCalls: parseCalls, flowLinks: flowLinks` to the export.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node plugin/templates/visualize.check.mjs`
Expected: `ok`

- [ ] **Step 5: Commit**

```bash
git add plugin/templates/visualize.html plugin/templates/visualize.check.mjs
git commit -m "feat(viewer): read page links from Call lines of actions"
```

---

### Task 2: Actions on cards and in the drawer

**Files:**
- Modify: `plugin/templates/visualize.html` (`model`, `cardHtml`, drawer `body`/`openDrawer`)
- Test: `plugin/templates/visualize.check.mjs`

**Interfaces:**
- Consumes: `flowLinks` (Task 1), `linkIndex` keys (`ext:<id>` for externals).
- Produces: flow node field `unit: 'action' | 'step'`; exported `actionDetails(details, keyOf) → string` (HTML).

- [ ] **Step 1: Write the failing tests**

Add `actionDetails` to the destructure. Add after the Task 1 tests:

```js
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
const shopIdx = linkIndex({ external: [{ id: 'stripe' }], projects: [{ id: 'web', flows: [{ id: 'shop', actions: '## Pay\n- Call: `stripe`\n- Code: `a#b`' }] }] });
assert.match(cardHtml(model({ id: 'web', flows: [{ id: 'shop', kind: 'page', actions: '' }] }, shopIdx).flows[0], false), /data-goto="ext:stripe" title="calls">→ stripe</);

// Action details: a Call is a link to its target; Then and Fail stay text.
const keyOf = (to) => (to === 'stripe' ? 'ext:stripe' : to);
assert.equal(actionDetails(['Call: `stripe`: pay.', 'Then: open `/done`.', 'Fail: show <b>.'], keyOf),
  '<ul class="details"><li><span class="meta">Call</span> <button class="link" data-goto="ext:stripe">stripe</button> pay.</li>' +
  '<li><span class="meta">Then</span> open <code>/done</code>.</li><li><span class="meta">Fail</span> show &lt;b&gt;.</li></ul>');
assert.equal(actionDetails([], keyOf), '');
assert.equal(actionDetails(['Keep the draft.'], keyOf), '<ul class="details"><li>Keep the draft.</li></ul>');
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node plugin/templates/visualize.check.mjs`
Expected: FAIL on the `2 actions` match.

- [ ] **Step 3: Implement the pure parts**

In `model`, after the `var fn = {…};` line, add:

```js
      fn.unit = typeof f.actions === 'string' ? 'action' : 'step';
```

In `cardHtml`, change the toggle label and the step number:

```js
      var unit = n.unit || 'step';
      h += '<button type="button" class="toggle" data-toggle="' + esc(n.key) + '" aria-expanded="' + !!open + '">' +
        (open ? '▾ ' : '▸ ') + steps.length + ' ' + unit + (steps.length === 1 ? '' : 's') + '</button>';
```

and in the step `<li>`: `'<span class="n">' + (unit === 'action' ? '•' : esc(s.num)) + '</span>'`.

Add after `cardHtml`:

```js
  // The bullets of an action as HTML. A `Call:` target is a link. keyOf maps a target to its key.
  function actionDetails(details, keyOf) {
    var d = details || [];
    return d.length ? '<ul class="details">' + d.map(function (x) {
      var m = /^(Call|Then|Fail):\s*(.*)$/.exec(x), c;
      if (!m) return '<li>' + inline(x) + '</li>';
      var h = '<li><span class="meta">' + m[1] + '</span> ';
      if (m[1] === 'Call' && (c = /^`([^`]+)`\s*(?::\s*(.*))?$/.exec(m[2]))) {
        return h + '<button class="link" data-goto="' + esc(keyOf(c[1])) + '">' + esc(c[1]) + '</button>' + (c[2] ? ' ' + inline(c[2]) : '') + '</li>';
      }
      return h + inline(m[2]) + '</li>';
    }).join('') + '</ul>' : '';
  }
```

Export `actionDetails`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node plugin/templates/visualize.check.mjs`
Expected: `ok`

- [ ] **Step 5: Browser parts (drawer)**

Below the browser line, add a helper before `body`:

```js
  function keyOf(to) { return state.ext[to] ? 'ext:' + to : to; }

  // The bullets of a step, or of an action with its Call links.
  function bulletsHtml(s, isAction) { return isAction ? actionDetails(s.details, keyOf) : detailsHtml(s); }
```

In `main`, after `state.links = …`, add: `state.ext = {}; (state.data.external || []).forEach(function (x) { state.ext[x.id] = 1; });`

In `body`:
- `tab === 'step'` branch: `var act = typeof n.parent.actions === 'string';` use `bulletsHtml(it, act)` instead of `detailsHtml(it)`, and the heading `'<h5>' + (act ? 'Page' : 'Flow') + '</h5>'`.
- Change `if (tab === 'steps') {` to `if (tab === 'steps' || tab === 'actions') {`. Inside, `var act = tab === 'actions';`. Use `'<ol class="list">'` for steps and `'<ul class="list">'` for actions (close with the same tag); the number span is `act ? '•' : esc(s.n)`; use `bulletsHtml(s, act)` for the bullets; the empty text is `act ? 'No actions.' : 'No steps.'`.

In `openDrawer`, change the flow tabs to:

```js
      [ 'definition', typeof n.item.actions === 'string' ? 'actions' : 'steps', 'boundary', 'links', 'rules' ];
```

- [ ] **Step 6: Run the check and a headless browser test**

Run: `node plugin/templates/visualize.check.mjs` → `ok`.

Build a throwaway page from the current example data with one page converted in memory (set `actions` on `web/new-post` and its steps to actions), inject a script that opens the page card, clicks the Actions tab and the Call link, and writes `location.hash` + the selected key to `document.title`. Run with Chrome `--headless=new --virtual-time-budget=2000 --dump-dom`.
Expected: title has `hash=#api` and `sel=api/create-post`; no `ERR`.

- [ ] **Step 7: Commit**

```bash
git add plugin/templates/visualize.html plugin/templates/visualize.check.mjs
git commit -m "feat(viewer): show page actions on cards and in the drawer"
```

---

### Task 3: Docs

**Files:**
- Create: `plugin/templates/rules/actions.md`, `plugin/templates/rules/examples/actions.md`
- Modify: `plugin/templates/rules/steps.md`, `plugin/templates/rules/boundary.md`, `plugin/templates/BUILD.md`, `plugin/templates/WORKFLOW.md`, `plugin/templates/AGENTS.md`, `plugin/skills/init/SKILL.md`

- [ ] **Step 1: `rules/actions.md`**

````md
# Rule: `actions.md`

Path: `.mirror/xsrc/<project>/<page>/actions.md`. Use it for the pages of `frontend` and `expo`
projects. Backend, worker and consumer flows use `steps.md`.

## Sections

- One `## <action>` header per user action or page event. Start the title with a verb: Open,
  Click, Submit, Change, Scroll, Pull.
- Do not number the actions. A page does not run them in order.
- Under the header, write the bullets in this order:
  - `- Call: ` and the target in backticks, then `: <note>`. Write one bullet per call. The note
    is optional.
  - `- Then: ` and what the page does after a success.
  - `- Fail: ` and what the page does after a failure.
  - `- Code: ` and the code reference in backticks. Write it one time, last.
- Skip a `Call:`, `Then:` or `Fail:` bullet when the action does not have it.

## Calls

- The target is `<project>/<flow>`, `<project>` when the flow is not known, or the id of an
  external system in `.mirror/config.json`.
- Each `Call:` is a `calls` link. The viewer draws it. Do not write the links again in
  `boundary.md`.
- Write local work (state, navigation, storage) in `Then:` or `Fail:`, not in `Call:`.
- The check fails on a `Call:` bullet without backticks, and on a target that does not exist.

## Code reference

- The form is `path#function`, as in `steps.md`.
- Use the handler of the action: the page component for "Open", the handler for a click or a
  submit.

## Example

See `.mirror/rules/examples/actions.md`.
````

- [ ] **Step 2: `rules/examples/actions.md`**

```md
## Open the page
- Call: `api/get-user`: load the user from the route `id`.
- Then: show the form with the name and the email.
- Fail: show "User not found." when the API returns 404.
- Code: `src/pages/EditUserPage.tsx#EditUserPage`

## Click "Save"
- Call: `api/update-user`: send the changed fields.
- Then: open `/users/<id>`.
- Fail: show the API error message on the form.
- Code: `src/components/UserForm.tsx#onSubmit`

## Click "Cancel"
- Then: open `/users/<id>`.
- Code: `src/components/UserForm.tsx#onCancel`
```

- [ ] **Step 3: `rules/steps.md`**

Change line 3 to: ``Path: `.mirror/xsrc/<project>/<flow>/steps.md`. Use it for `backend`, `worker` and `consumer` flows. Pages use `actions.md`.``

- [ ] **Step 4: `rules/boundary.md`**

- Dependencies bullet: append `A page has no Dependencies section: its calls are in \`actions.md\`.`
- Pages section: replace the last bullet with `- Do not write a \`## Dependencies\` section. Write each call of the page as a \`Call:\` bullet in \`actions.md\`.`

- [ ] **Step 5: `BUILD.md`**

In "Build the data" step 2 (flow entry):
- Add after `boundary`, `rules`: ``- `actions`: the full text of `actions.md`, for a page that has it. Else leave it out.``
- Change the `steps` bullet to start: ``- `steps`: for a flow, one entry for each `## N. <step>` header in `steps.md`, in order. For a page with `actions.md`, see "Page actions".`` (keep the sub-bullets).

Add after the shape block's note:

```md
### Page actions

For a page with `actions.md`, make one `steps` entry for each `## <action>` header, in order:

- `n`: the position of the action, from 1.
- `ref`: the backtick span of the `- Code:` bullet, without the backticks. Use `""` when there is none.
- `title`: the header text. End it with a period.
- `details`: each other bullet, in order, without the `- `, with its label (`Call: …`, `Then: …`,
  `Fail: …`). End each with a period.
- `text`: the title, then each detail, joined with a space.
- `status`: `null`.

A page without `actions.md` builds its `steps` from `steps.md`.
```

In "Review page" step 3: add `actions` to the list of flow fields that make a flow `changed` and to the fields copied to `old`. Add: ``When the old flow has no `actions` and the new one has, set `old.actions` to `null`.``

- [ ] **Step 6: `WORKFLOW.md`, `AGENTS.md`, `init`**

- `WORKFLOW.md` "Change the mirror": `- A new flow or page: create its folder with the four files. A page has \`actions.md\` in place of \`steps.md\`.`
- `WORKFLOW.md` "Code" item 5: `For each changed \`steps.md\` and \`actions.md\`, make sure …`
- `AGENTS.md` layout line: `` `definition.md`, `steps.md` (a page: `actions.md`), `boundary.md`, `rules.md`.`` and add a table row: ``| `xsrc/<project>/<page>/actions.md` | `actions.md` | `examples/actions.md` |``
- `init` "Write the documents" item 2: after `rules/steps.md`, add `(a page: \`rules/actions.md\`)`. Change item 4 to: ``Write the links. For a flow, write them in `## Dependencies` of `boundary.md` with the "Links" rule. For a page, write one `Call:` bullet per call in `actions.md`. Find the actions from the load effect, the event handlers and the form submits. For each API call, find the backend flow with the same method and path.``

- [ ] **Step 7: Verify and commit**

Run: `node plugin/templates/visualize.check.mjs` → `ok`. Run `git grep -n "steps.md" plugin/` and check that each hit that talks about pages names `actions.md`.

```bash
git add plugin/
git commit -m "docs: actions.md for pages"
```

---

### Task 4: Example repo

**Files:**
- Create: `examples/posts/.mirror/xsrc/web/{new-post,edit-post,post-detail,posts-list}/actions.md`
- Delete: the same 4 folders' `steps.md`
- Modify: the same 4 folders' `boundary.md` (drop `## Dependencies`)
- Copy: changed templates to `examples/posts/.mirror/` (`AGENTS.md`, `BUILD.md`, `WORKFLOW.md`, `rules/actions.md`, `rules/examples/actions.md`, `rules/steps.md`, `rules/boundary.md`)
- Rebuild: `examples/posts/.mirror/visualize.html`

- [ ] **Step 1: Write the actions**

`new-post/actions.md`:
```md
## Open the page
- Then: show an empty form with a title, a body and an author id.
- Code: `src/pages/NewPostPage.tsx#NewPostPage`

## Click "Create"
- Call: `api/create-post`: `POST /api/posts` with the form values.
- Then: open the detail page of the new post.
- Fail: show the error message of the API on the form.
- Code: `src/components/PostForm.tsx#PostForm`
```

`edit-post/actions.md`:
```md
## Open the page
- Call: `api/get-post`: `GET /api/posts/:id` with the route `id`.
- Then: show the form with the current title and body.
- Fail: show an alert when the post does not exist.
- Code: `src/pages/EditPostPage.tsx#EditPostPage`

## Click "Save"
- Call: `api/update-post`: `PATCH /api/posts/:id` with the title and the body.
- Then: open the detail page of the post.
- Fail: show the error message of the API on the form.
- Code: `src/components/PostForm.tsx#PostForm`
```

`post-detail/actions.md`:
```md
## Open the page
- Call: `api/get-post`: `GET /api/posts/:id` with the route `id`.
- Then: show the title, the author, the update time and the body.
- Fail: show an alert when the post does not exist.
- Code: `src/pages/PostDetailPage.tsx#PostDetailPage`

## Click "Delete"
- Call: `api/delete-post`: `DELETE /api/posts/:id` after the user confirms.
- Then: go to the list.
- Code: `src/pages/PostDetailPage.tsx#PostDetailPage`
```

(The rule puts `Call:` before `Then:`, so the confirmation goes in the note of the Call.)

`posts-list/actions.md`:
```md
## Open the page
- Call: `api/list-posts`: `GET /api/posts` with the optional `authorId` from the URL query.
- Then: show each post as a link to its detail page. Show "No posts yet." for an empty list.
- Code: `src/pages/PostsListPage.tsx#PostsListPage`

## Type an author id
- Call: `api/list-posts`: load the posts again with the new `authorId`.
- Then: put the author id into the URL query.
- Code: `src/pages/PostsListPage.tsx#PostsListPage`
```

Check each `Code:` function exists: `git grep -n "function NewPostPage\|function EditPostPage\|function PostDetailPage\|function PostsListPage\|function PostForm" examples/posts/web/src`.

- [ ] **Step 2: Remove the old files and sections**

Delete the 4 `steps.md`. In the 4 `boundary.md`, delete the `## Dependencies` header and its bullets (it is the last section in each).

- [ ] **Step 3: Rebuild**

Extend the scratch `rebuild.mjs` from the links plan: for each page folder with `actions.md`, set `f.actions` to its text and rebuild `f.steps` with "Page actions" of `BUILD.md`:

```js
function actionSteps(md) {
  const out = [];
  let cur = null;
  const dot = (s) => (/[.!?]$/.test(s) ? s : s + '.');
  for (const line of md.split(/\r?\n/)) {
    const h = /^##\s+(.*)$/.exec(line);
    if (h) { out.push(cur = { n: out.length + 1, title: dot(h[1].trim()), details: [], ref: '', status: null }); continue; }
    const b = cur && /^\s*-\s+(.*)$/.exec(line);
    if (!b) continue;
    const code = /^Code:\s*`([^`]+)`/.exec(b[1]);
    if (code) cur.ref = code[1]; else cur.details.push(dot(b[1].trim()));
  }
  for (const s of out) s.text = [s.title, ...s.details].join(' ');
  return out;
}
```

In the flow loop: `if (existsSync(a)) { f.actions = readFileSync(a, 'utf8'); f.steps = actionSteps(f.actions); } else delete f.actions;` with `a = \`${dir}/xsrc/${p.id}/${f.id}/actions.md\``.

Run it, then: `node plugin/templates/visualize.check.mjs examples/posts/.mirror/visualize.html` → `ok`.

- [ ] **Step 4: Browser check (headless)**

Screenshot the `web` tab and the System tab. Expected: web cards say `▸ 2 actions`; System shows `web → api` with `7 calls` (new-post 1, edit-post 2, post-detail 2, posts-list 2).

- [ ] **Step 5: Commit**

```bash
git add -A examples/posts/.mirror
git commit -m "docs(example): web pages use actions.md"
```

---

## Self-review notes

- Spec coverage: format (Task 3 rule + Task 4 example), data (Task 3 BUILD + Task 4 rebuild), viewer links/check (Task 1), cards/drawer (Task 2), docs (Task 3), example (Task 4), tests (Tasks 1–2).
- Review Focus 1 → `moved` test; 2 → `pages` test (`web/old`) and `m.flows[0].unit`; 3 → `- Call: api/x` bad; 4 → `Open` action with only Code; 5 → `ext:stripe` chip.
