---
name: build
description: Build .mirror/visualize.html, or a review page in .mirror/features/, from the files in .mirror/xsrc/. Use when the user asks to build, rebuild or redraw the Mirror viewer.
---

# Build visualize.html

The template `visualize.html` of this skill is in the base directory of this skill.

## Inputs

- `.mirror/xsrc/**`
- The template: `.mirror/visualize.html`. When it does not exist, use `visualize.html` of this
  skill.

## Build the data

1. Make one project entry for each key in `projects` of `xsrc/config.json`. Keep the key order.
   - `id`: the key.
   - `kind`: the `kind` value from `xsrc/config.json`.
   - `definition`: the full text of `xsrc/<project>/definition.md`.
   - `status`: `null`.
   - `flows`: see step 2.
2. Make one flow entry for each sub-folder of `xsrc/<project>/`. Sort by folder name.
   - `id`: the folder name.
   - `trigger`, `entry`, `group`: the values from the frontmatter of `definition.md`, trimmed.
     Use `""` for a missing `group`.
   - `kind`: `page` when `trigger` is `page`. Else `flow`.
   - `definition`: the text of `definition.md` after the frontmatter.
   - `boundary`: for a flow, the full text of `boundary.md`. For a page, leave it out.
   - `design`: for a page, the full text of `design.md`. For a flow, leave it out.
   - `rules`: the full text of `business-rules.md`.
   - `actions`: for a page, the full text of `actions.md`. For a flow, leave it out.
   - `status`: `null`.
   - `steps`: for a flow, one entry for each `## N. <step>` header in `steps.md`, in order. For
     a page, see "Page actions".
     - `n`: the number `N`.
     - `title`: the header text after `N.`. End it with a period.
     - `details`: each other bullet under the header, in order, without the `- `. End each
       with a period. Use `[]` when there is none.
     - `text`: the header text after `N.`, then each other bullet under the header, joined
       with a space. End each part with a period.
     - `status`: `null`.
3. Set `generated` to today in the form `YYYY-MM-DD`. Set `title` to the repository folder name.
4. Write the data as JSON. Replace each `<` with `\u003c`.

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

### Page actions

For a page, make one `steps` entry for each `## <action>` header in `actions.md`, in order:

- `n`: the position of the action, from 1.
- `title`: the header text. End it with a period.
- `details`: each other bullet, in order, without the `- `, with its label (`Call: …`,
  `Then: …`, `Fail: …`). End each with a period.
- `text`: the title, then each detail, joined with a space.
- `status`: `null`.

## Write the page

1. Copy the template to the target path.
2. Replace the text between `/* MIRROR:TOKENS:START */` and `/* MIRROR:TOKENS:END */` with
   the same block of `.mirror/visualize.html`, if it exists. This keeps the colors and fonts of the user.
3. Replace the content of `<script type="application/json" id="mirror-data">` with the JSON.
4. Make sure that the data block is valid JSON.

## Review page

1. Read the old data: the JSON in `<script id="mirror-data">` of the current `.mirror/visualize.html`.
   When `.mirror/visualize.html` does not exist, use empty old data, so each item is `added`.
2. Build the new data from `.mirror/xsrc/` with "Build the data".
3. Compare project by `id`, flow by project `id` + flow `id`, and step by `text`.
   - A project, flow or step only in the new data: set `status` to `added`.
   - A project, flow or step only in the old data: copy it into the new data at its old
     position and set `status` to `removed`. Set each descendant of a removed item (its flows and their steps) to `removed`.
   - A flow in both with a different `trigger`, `entry`, `group`, `definition`, `boundary`,
     `design`, `rules`, `actions` or step list: set `status` to `changed`.
   - A project in both with a different `definition`: set `status` to `changed`. A project with
     the same `definition` keeps `status` `null`, even when its flows changed.
   - For each `changed` project or flow, add `old`: an object with the old value of each of
     `trigger`, `entry`, `group`, `definition`, `boundary`, `design`, `rules` and `actions` that is
     different.
4. Write the page with "Write the page" to `.mirror/features/NNNN-<slug>.html`.
