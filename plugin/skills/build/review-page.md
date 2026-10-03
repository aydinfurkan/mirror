# Review page

1. Find the target path.
   - A new change: use the next free number `NNNN` in `.mirror/features/`. Start at `0001`.
     Make a kebab-case `<slug>` from the name of the change.
   - A change that already has a review page: use the same path.
2. Read the old data: the JSON in `<script id="mirror-data">` of `.mirror/visualize.html`.
   If `.mirror/visualize.html` does not exist, use empty old data. Then each item is `added`.
3. Make the new data with `build-data.md`.
4. Compare the old data and the new data. See "Compare".
5. Write the new data to the target path with `write-page.md`.

## Compare

Match a project by `id`, a flow by project `id` and flow `id`, and a step by `text`.

- An item only in the new data: set `status` to `added`.
- An item only in the old data: copy it into the new data at its old position. Set its
  `status` to `removed`. Set the `status` of each item in it (its flows and their steps) to
  `removed` too.
- A flow in both: set `status` to `changed` when its `trigger`, `entry`, `group`,
  `definition`, `boundary`, `design`, `rules`, `actions` or step list is different.
- A project in both: set `status` to `changed` when its `definition` is different. Else keep
  `status` `null`, also when its flows changed.
- For each `changed` project or flow, add `old`: an object with the old value of each of
  these fields that is different: `trigger`, `entry`, `group`, `definition`, `boundary`,
  `design`, `rules` and `actions`.
