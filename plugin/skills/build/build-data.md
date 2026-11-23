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
- For a flow only: `input` and `output`, the text under the `## Input` and the `## Output`
  headers of `flow.md`, without the header. And `contract`, the full text of `contract.md`.
- For an older flow with `steps.md` and `boundary.md`: `contract`, the full text of
  `boundary.md`. Leave out `input` and `output`. The viewer takes them from the contract.
- For a page only: `design`, the full text of `design.md`, and `actions`, the full text of
  `actions.md`.
- For a page only: `designSvg`, the full text of `ui/main/design.svg`. Leave it out when the
  file does not exist.
- For a page only: `designVariants`, one `{ "name", "svg" }` per other folder `ui/<name>/` with
  a `design.svg`: the name and the full text of the file. Use the order of the `## Variants`
  bullets of `design.md`, then the other folders by name. Leave it out when there is none.
- For a page only: `designVariations`, one `{ "name", "svg" }` per `ui/<view>/variations.svg`:
  `""` for `main`, else the name of the variant, and the full text of the file. Main first,
  then the order of `designVariants`. Leave it out when there is none.
- An older page has `design.svg` and `design-<name>.svg` next to `design.md`, and no `ui/`
  folder. Read `design.svg` as `ui/main/design.svg` and `design-<name>.svg` as
  `ui/<name>/design.svg`.
- `status`: `null`.
- `steps`: see "Steps".

## Steps

For a flow, make one step for each `## N. <step>` header in `flow.md` (or `steps.md`). For a page, make one
step for each `## <action>` header in `actions.md`. Keep the order of the file.

- `n`: for a flow, the number `N`. For a page, the position of the action, from 1.
- `title`: the header text, without `N.`. End it with a period.
- `details`: each bullet under the header, in order, without the `- `. For a page, keep the
  label of the bullet (`Call: …`, `Then: …`, `Fail: …`). End each with a period. Use `[]` when
  there is no bullet.
- `text`: the title, then each detail, joined with a space.
- `status`: `null`.

## Write the JSON

Replace each `<` with `\u003c`, so that the JSON is safe inside a `<script>` tag.

The shape:

```json
{
  "generated": "2026-09-25",
  "title": "my-repo",
  "projects": [{
    "id": "api", "kind": "backend", "definition": "…", "status": null,
    "flows": [{
      "id": "create-user", "kind": "flow", "trigger": "http", "entry": "POST /users", "group": "users",
      "definition": "…", "input": "…", "output": "…", "contract": "…", "rules": "…", "status": null,
      "steps": [{ "n": 1, "title": "Validate the body.", "text": "Validate the body.", "details": [], "status": null }]
    }]
  }]
}
```
