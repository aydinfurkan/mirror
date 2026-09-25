# Build visualize.html

`${CLAUDE_PLUGIN_ROOT}` is the plugin root: the folder that contains `templates/` and
`references/`.

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
     - `ref`: the text of the last backtick span on the line, when that span contains `#`. Use `""` when there is none.
     - `text`: the item text without that backtick span, trimmed.
     - `status`: `null`.
3. Set `generated` to today in the form `YYYY-MM-DD`. Set `title` to the repository folder name.
4. Write the data as JSON. Replace each `<` with `\u003c`.

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
   The old data is the last built graph. When `.mirror/visualize.html` does not exist, use
   empty old data, so each item is `added`.
2. Build the new data from `.mirror/xsrc/` with the steps above.
3. Compare project by `id`, flow by project `id` + flow `id`, and step by `ref` + `text`.
   - A project, flow or step only in the new data: set `status` to `added`.
   - A project, flow or step only in the old data: copy it into the new data at its old
     position and set `status` to `removed`. Set each descendant of a removed item (its flows and their steps) to `removed`.
   - A flow in both with a different `trigger`, `entry`, `definition`, `boundary`, `rules`
     or step list: set `status` to `changed`.
   - A project in both with a different `definition` or with a flow that is not `null`: set
     `status` to `changed`.
4. Write the page with "Write the page" to `.mirror/features/NNNN-<slug>.html`.
