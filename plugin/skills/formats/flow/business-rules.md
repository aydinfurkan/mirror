# Rule: flow `business-rules.md`

Path: `.mirror/xsrc/<project>/<flow>/business-rules.md`.

## Header

Three lines at the top. Write `none` when a line has no value.

- `**Relates to:**`: the other flows or pages that this one calls or is called by, as
  `<project>/<flow>` in backticks.
- `**Inherits:**`: the flows whose rules also apply here. Name what is inherited. Do not
  repeat those rules.
- `**Supersedes:**`: the flows or rules that this one replaces.

## Sections

Write in business words only, as the people who use the product talk. Do not write HTTP status
codes, endpoints, event or topic names, APIs, databases, caches, storage, retries or field
names. Put those in `boundary.md` or `steps.md`.

In this order. Each section is a bullet list, except `## Context`.

- `## Context`: one to three short sentences. Who uses the flow, and why.
- `## Goal`: what the flow does for the user.
- `## Non-goal`: what the flow does not do on purpose.
- `## Constraints`: the rules that need state or context: for example "only the author can
  delete a post". Put the shape limits in `boundary.md`, not here.
- `## Acceptance criteria`: each item becomes a test.
- `## Open questions`: what is not decided yet. Write `- None.` when all is decided.

## Example

See `examples/flow/business-rules.md`.
