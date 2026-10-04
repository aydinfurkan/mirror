# Rule: page `actions.md`

Path: `.mirror/xsrc/<project>/<page>/actions.md`. Use it for the pages of `frontend`, `mobile`
and `desktop` projects.

## Sections

- One `## <action>` header per user action or page event. Start the title with a verb: Open,
  Click, Submit, Change, Scroll, Pull.
- Do not number the actions. A page does not run them in order.
- Under the header, write the bullets in this order:
  - `- Call: ` and the target in backticks, then `: <note>`. Write one bullet per call. The note
    is optional.
  - `- Then: ` and what the page does after a success.
  - `- Fail: ` and what the page does after a failure.
- Skip a `Call:`, `Then:` or `Fail:` bullet when the action does not have it.

## Calls

- Each `Call:` is a `calls` link. Write the target and the note with "Links" in
  `flow/boundary.md`.
- Write local work (state, navigation, storage) in `Then:` or `Fail:`, not in `Call:`.

## Example

See `examples/page/actions.md`.
