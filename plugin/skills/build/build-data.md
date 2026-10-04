# Build the data

Read `.mirror/xsrc/` and make one JSON object. Each path in this file is relative to
`.mirror/xsrc/`.

## Top level

- `generated`: today, in the form `YYYY-MM-DD`.
- `title`: the name of the repository folder.
- `projects`: one entry for each key in `projects` of `config.json`, in the key order.

## Project

- `id`: the key in `config.json`.
- `kind`: the `kind` value in `config.json`.
- `definition`: the full text of `<project>/definition.md`.
- `status`: `null`.
- `flows`: one entry for each sub-folder of `<project>/`, sorted by folder name.

## Flow or page

Each sub-folder is a flow or a page. Read its `definition.md` first.

- `id`: the folder name.
- `trigger`, `entry`, `group`: the values in the frontmatter of `definition.md`, trimmed.
  Use `""` when `group` is missing.
- `kind`: `page` when `trigger` is `page`. Else `flow`.
- `definition`: the text of `definition.md` after the frontmatter.
- `rules`: the full text of `business-rules.md`.
- For a flow only: `boundary`, the full text of `boundary.md`.
- For a page only: `design`, the full text of `design.md`, and `actions`, the full text of
  `actions.md`.
- `status`: `null`.
- `steps`: see "Steps".

## Steps

For a flow, make one step for each `## N. <step>` header in `steps.md`. For a page, make one
step for each `## <action>` header in `actions.md`. Keep the order of the file.

- `n`: for a flow, the number `N`. For a page, the position of the action, from 1.
- `title`: the header text, without `N.`. End it with a period.
- `details`: each bullet under the header, in order, without the `- `. For a page, keep the
  label of the bullet (`Call: …`, `Then: …`, `Fail: …`). End each with a period. Use `[]` when
  there is no bullet.
- `text`: the title, then each detail, joined with a space.
- `status`: `null`.

## Write the JSON

Replace each `<` with `<`, so that the JSON is safe inside a `<script>` tag.

The shape:

```json
{
  "generated": "2026-09-25",
  "title": "my-repo",
  "projects": [{
    "id": "api", "kind": "backend", "definition": "…", "status": null,
    "flows": [{
      "id": "create-user", "kind": "flow", "trigger": "http", "entry": "POST /users", "group": "users",
      "definition": "…", "boundary": "…", "rules": "…", "status": null,
      "steps": [{ "n": 1, "title": "Validate the body.", "text": "Validate the body.", "details": [], "status": null }]
    }]
  }]
}
```
