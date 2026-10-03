# Review page

1. Read the old data: the JSON in `<script id="mirror-data">` of the current `.mirror/visualize.html`.
   When `.mirror/visualize.html` does not exist, use empty old data, so each item is `added`.
2. Build the new data from `.mirror/xsrc/` with `build-data.md`.
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
4. Write the page with `write-page.md` to `.mirror/features/NNNN-<slug>.html`.
