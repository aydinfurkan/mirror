# Build visualize.html

`.mirror/WORKFLOW.md` and the Mirror `init` skill use this procedure.

## Inputs

- `.mirror/config.json`
- `.mirror/visualize.md`
- `.mirror/xsrc/**`
- The template: `.mirror/visualize.html`. When it does not exist, use `templates/visualize.html`
  of the Mirror plugin.

## Build the data

1. Make one project entry for each key in `projects` of `config.json`. Keep the key order.
   - `id`: the key.
   - `kind`: the `kind` value from `config.json`.
   - `definition`: the full text of `xsrc/<project>/definition.md`.
   - `status`: `null`.
   - `flows`: see step 2.
2. Make one flow entry for each sub-folder of `xsrc/<project>/`. Sort by folder name.
   - `id`: the folder name.
   - `trigger`, `entry`, `group`: the values from the frontmatter of `definition.md`, trimmed.
     Use `""` for a missing `group`.
   - `kind`: `page` when `trigger` is `page`. Else `flow`.
   - `definition`: the text of `definition.md` after the frontmatter.
   - `boundary`, `rules`: the full text of `boundary.md` and `rules.md`.
   - `status`: `null`.
   - `steps`: one entry for each `## N. <step>` header in `steps.md`, in order.
     - `n`: the number `N`.
     - `ref`: the backtick span of the `- Code:` bullet under the header, without the
       backticks. Use `""` when there is none.
     - `title`: the header text after `N.`. End it with a period. The graph shows only it.
     - `details`: each other bullet under the header, in order, without the `- `. End each
       with a period. The step detail shows them as bullets. Use `[]` when there is none.
     - `text`: the header text after `N.`, then each other bullet under the header, joined
       with a space. End each part with a period.
     - `status`: `null`.
3. Make one external entry for each key in `external` of `config.json`. Keep the key order.
   Use `[]` when `external` does not exist.
   - `id`: the key.
   - `kind`, `name`: the values from `config.json`.
4. Set `generated` to today in the form `YYYY-MM-DD`. Set `title` to the repository folder name.
5. Write the data as JSON. Replace each `<` with `<`.

The shape:

```json
{
  "generated": "2026-09-25",
  "title": "my-repo",
  "external": [{ "id": "users-db", "kind": "database", "name": "Postgres" }],
  "projects": [{
    "id": "api", "kind": "backend", "definition": "…", "status": null,
    "flows": [{
      "id": "create-user", "kind": "flow", "trigger": "http", "entry": "POST /users", "group": "users",
      "definition": "…", "boundary": "…", "rules": "…", "status": null,
      "steps": [{ "n": 1, "title": "Validate the body.", "text": "Validate the body.", "details": [], "ref": "src/users/route.ts#postUser", "status": null }]
    }]
  }]
}
```

The data holds no links. The page reads them from the `## Dependencies` section of each
`boundary`. It also finds the incoming links and the lines between projects.

## Write the page

1. Copy the template to the target path.
2. Replace the text between `/* MIRROR:TOKENS:START */` and `/* MIRROR:TOKENS:END */` with
   the full content of the `css` fence in `.mirror/visualize.md`.
3. Replace the content of `<script type="application/json" id="mirror-data">` with the JSON.
4. Check the page. When the Mirror plugin is installed, run
   `node <plugin root>/templates/visualize.check.mjs <target path>`. It must print `ok`.
   Else make sure that the data block is valid JSON.
5. When the check prints a link error, fix the `boundary.md` or the `external` map in
   `config.json`. Then build the page again.

## Review page

1. Read the old data: the JSON in `<script id="mirror-data">` of the current `.mirror/visualize.html`.
   The old data is the last built graph. When `.mirror/visualize.html` does not exist, use
   empty old data, so each item is `added`.
2. Build the new data from `.mirror/xsrc/` with "Build the data".
3. Compare project by `id`, flow by project `id` + flow `id`, and step by `ref` + `text`.
   - A project, flow or step only in the new data: set `status` to `added`.
   - A project, flow or step only in the old data: copy it into the new data at its old
     position and set `status` to `removed`. Set each descendant of a removed item (its flows and their steps) to `removed`.
   - A flow in both with a different `trigger`, `entry`, `group`, `definition`, `boundary`, `rules`
     or step list: set `status` to `changed`.
   - A project in both with a different `definition` or with a flow that is not `null`: set
     `status` to `changed`.
   - For each `changed` project or flow, add `old`: an object with the old value of each of
     `trigger`, `entry`, `group`, `definition`, `boundary` and `rules` that is different. The
     page shows the old lines crossed out and the new lines in yellow.
4. Write the page with "Write the page" to `.mirror/features/NNNN-<slug>.html`.
