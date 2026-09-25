# Mirror v2: flow mirrors, static viewer, Claude plugin

Date: 2026-09-25
Status: approved design

## Goal

Replace the per-file mirror model with a per-flow model. Replace the React visualize app
with one static HTML file. Ship Mirror as a Claude Code plugin with two skills: `init` and
`add-feature`.

## Decisions

| Topic               | Decision                                                                 |
| ------------------- | ------------------------------------------------------------------------ |
| Old visualize app   | Delete `.mirror/visualize/` fully. No drift check script.                |
| BR / ADR folders    | Delete. Business rules go into each flow's `rules.md`. Project-wide tech choices go into the project's `definition.md`. |
| Plugin location     | This repo is the plugin. Other repos install it; `init` creates `.mirror/` there. `code/` stays as the demo project. |
| HTML build          | Plugin ships one fixed template. The skill copies tokens and rewrites one JSON data block. |
| Feature review page | Diff graph over the full graph. Kept as history in `.mirror/features/`.  |

## 1. Target repo layout (created by `init`)

```
.mirror/
  AGENTS.md            rules for agents
  config.json          project list
  visualize.md         design tokens and their meaning
  visualize.html       current graph, rebuilt after each change
  features/
    NNNN-<slug>.html   review page per feature, kept as history
  xsrc/
    <project>/
      definition.md    what the project is for, stack, main tech choices
      <flow-or-page>/  kebab-case name: create-user, send-message, home, profile
        definition.md  what it does, and its trigger
        steps.md       ordered steps; each step names file#function
        boundary.md    inputs, outputs, external dependencies
        rules.md       business rules and acceptance criteria
AGENTS.md              one line: read .mirror/AGENTS.md
```

### config.json

```json
{
  "projects": {
    "api": { "root": "code", "kinds": ["backend"] }
  }
}
```

`root` is repo-relative. `kinds` holds one or more of `backend`, `worker`, `consumer`,
`frontend`, `expo`. One project can mix `backend`, `worker` and `consumer`.

### Flow / page files

`definition.md`:

```markdown
---
trigger: http            # http | main | message | schedule | page
entry: POST /bubbles     # endpoint, queue/topic, script name, or route path
---
Create a bubble for an owner.
```

`steps.md`: a numbered list. Each item is one sentence, then the code reference in
backticks. The reference is relative to the project root.

```markdown
1. Validate the request body. `src/api/routes/bubbles.schema.ts#parseCreateBubbleBody`
2. Create the bubble and save it. `src/domain/bubble.service.ts#createBubble`
3. Return HTTP 201 with the bubble. `src/api/routes/bubbles.route.ts#postBubble`
```

`boundary.md`: three sections: `## Input`, `## Output`, `## Dependencies` (DB, queues,
external APIs, other flows).

`rules.md`: a list of business rules, then `## Acceptance criteria`.

Pages (`frontend`, `expo`) use the same four files. Steps describe data loads and user
actions. Boundary lists the API calls the page makes.

## 2. visualize.md and visualize.html

`visualize.md` contains one fenced `css` block with a `:root` rule, then prose that says
what each token means. Default tokens:

```css
:root {
  --bg: #0f1115;  --panel: #171a21;  --text: #e6e6e6;  --muted: #8a8f98;
  --project: #6c8cff;  --flow: #3fb68b;  --page: #e0a84f;  --step: #8a8f98;
  --added: #2ea043;  --changed: #d29922;  --removed: #f85149;
  --box-w: 220px;  --box-h: 56px;  --gap-x: 80px;  --gap-y: 24px;
  --radius: 8px;  --font: system-ui, sans-serif;
}
```

The template `visualize.html` is one file with inline CSS and JS and no external
dependencies. It works offline from `file://`.

- Layout left to right: project, then flow/page, then steps. SVG tree.
- Clicking a project or flow node opens a side panel with `definition`, `boundary` and
  `rules`, rendered with a small inline markdown renderer (headings, lists, code, bold).
- Nodes with `status` get a border in `--added`, `--changed` or `--removed`, and a legend
  appears.

The skill builds the page in two edits to a copy of the template:

1. Replace the text between `/* MIRROR:TOKENS:START */` and `/* MIRROR:TOKENS:END */` with
   the `:root` block from `visualize.md`.
2. Replace the content of `<script type="application/json" id="mirror-data">` with the data.

Data shape:

```json
{
  "generated": "2026-09-25",
  "title": "Mirror",
  "projects": [{
    "id": "api", "kinds": ["backend"], "definition": "…", "status": null,
    "flows": [{
      "id": "create-bubble", "kind": "flow", "trigger": "http", "entry": "POST /bubbles",
      "definition": "…", "boundary": "…", "rules": "…", "status": null,
      "steps": [{ "n": 1, "text": "Validate the request body.",
                  "ref": "src/api/routes/bubbles.schema.ts#parseCreateBubbleBody",
                  "status": null }]
    }]
  }]
}
```

`kind` is `flow` or `page`. `status` is `added`, `changed`, `removed` or `null`. Only feature
review pages set it. In the data, `</` is escaped as `<\/` so markdown cannot close the
script tag.

## 3. `init` skill

1. Find projects. Read manifests (`package.json`, `app.json`, `go.mod`, `pyproject.toml`,
   etc.). Propose the project list with `root` and `kinds`. Wait for the user's OK. Write
   `config.json`.
2. Find entry points per kind:
   - `backend`: each HTTP endpoint (method + path).
   - `worker`: each process start (`main`) or scheduled job.
   - `consumer`: each message or queue handler.
   - `frontend` / `expo`: each page or screen route.
3. Show the flow/page list. Wait for the user's OK. The user can rename, merge or drop.
4. For each project write `definition.md`. For each flow/page trace the code from the entry
   point and write the four files.
5. Write `visualize.md` with default tokens if it does not exist. Build `visualize.html`.
6. Write `.mirror/AGENTS.md` and the root `AGENTS.md` pointer if missing.

If `.mirror/xsrc/` already exists, stop and ask: overwrite, or keep and only add missing
flows.

## 4. `add-feature` skill

1. Ask what the feature is. Find the affected projects and flows/pages.
2. Change the mirror first: add, edit or delete flow/page folders in `xsrc/`. Change no code.
3. Build the review page. Old data = the JSON block in the current `visualize.html`. New
   data = read from `xsrc/`. Compare by project id, flow id and step `ref` + `text`:
   - flow or step only in new: `added`
   - flow or step only in old: `removed` (kept in the data so it is drawn)
   - flow in both with any different field or step: `changed`
   Write `.mirror/features/NNNN-<slug>.html`. NNNN is the next free 4-digit number.
4. Review gate. Ask the user to open the page. Wait.
   - Changes wanted: edit the md files, rebuild the same review page, ask again.
   - Cancel: revert the `xsrc/` changes with git. Delete the review page.
5. Execute, only after an explicit OK:
   - Write failing tests for the changed steps, then the code, until the tests pass.
   - Check that every `file#function` in changed `steps.md` files exists. Fix mismatches.
   - Rebuild `visualize.html` from `xsrc/` with all `status` values `null`.
6. Report the changed files and the test result.

## 5. Plugin layout (this repo)

```
.claude-plugin/
  plugin.json
  marketplace.json
skills/
  init/SKILL.md
  add-feature/SKILL.md
templates/
  visualize.html       the viewer template
  visualize.md         default tokens
  AGENTS.md            the .mirror/AGENTS.md content
```

Skills refer to templates with `${CLAUDE_PLUGIN_ROOT}/templates/…`.

## 6. Migrate this repo

- Delete `.mirror/visualize/`, `.mirror/docs/`, `.mirror/STRUCTURE.md`, and the
  `.mirror/visualize/src/generated/` line in `.gitignore`.
- Apply the `init` flow by hand to `code/`: project `api` (`backend`) with flows
  `create-bubble`, `complete-bubble`, `list-owner-bubbles`. Carry the rules from BR-0001 to
  BR-0004 into the matching `rules.md`, and the ADR content into `api/definition.md`.
- Rewrite `README.md` and `.mirror/AGENTS.md` for the new model.

## Testing

- Template: open `visualize.html` built for this repo in a browser. Check the tree draws,
  the side panel opens, and a review page shows the status colors and legend.
- Skills: run `init` in a scratch copy of `code/` with `.mirror/` removed and compare with
  the hand-written migration. Run `add-feature` for a small feature (for example
  "delete a bubble") and check the review page, then the executed code and tests.
- `npm -C code run test` still passes after migration.

## Out of scope

- Automatic drift detection.
- Parsers per language. The skills read code with the model, not with a parser.
