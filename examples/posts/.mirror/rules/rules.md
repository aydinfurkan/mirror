# Rule: `rules.md`

Path: `.mirror/xsrc/<project>/<flow-or-page>/rules.md`.

## Header

Three lines at the top. Write `none` when a line has no value.

- `**Relates to:**`: the other flows or pages that this one calls or is called by, as
  `<project>/<flow>` in backticks.
- `**Inherits:**`: the flows whose rules also apply here. Name what is inherited. Do not
  repeat those rules.
- `**Supersedes:**`: the flows or rules that this one replaces.

## Sections

In this order. Each section is a bullet list, except `## Context`.

- `## Context`: one to three short sentences. Who uses the flow, and why.
- `## Goal`: what the flow does for the user.
- `## Non-goal`: what the flow does not do on purpose.
- `## Constraints`: the rules that need state or context: for example "only the author can
  delete a post". Put the shape limits in `boundary.md`, not here.
- `## Acceptance criteria`: each item becomes a test.
- `## Open Questions`: what is not decided yet. Write `- None.` when all is decided.

## Example

See `.mirror/rules/examples/rules.md`.
