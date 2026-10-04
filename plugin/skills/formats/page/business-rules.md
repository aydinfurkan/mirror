# Rule: page `business-rules.md`

Path: `.mirror/xsrc/<project>/<page>/business-rules.md`.

## Header

Three lines at the top. Write `none` when a line has no value.

- `**Relates to:**`: the other flows or pages that this page calls or links to, as
  `<project>/<flow>` in backticks.
- `**Inherits:**`: the pages or flows whose rules also apply here. Name what is inherited. Do not
  repeat those rules.
- `**Supersedes:**`: the pages or rules that this one replaces.

## Sections

Write in business words only, as the people who use the product talk. Do not write HTTP status
codes, endpoints, event or topic names, APIs, databases, caches, storage, retries or field
names. Put those in `actions.md` or `design.md`.

In this order. Each section is a bullet list, except `## Context`.

- `## Context`: one to three short sentences. Who uses the page, and why.
- `## Goal`: what the page does for the user.
- `## Non-goal`: what the page does not do on purpose.
- `## Constraints`: the rules that need state or context: for example "only the author can
  delete a post". Put the look of the page in `design.md`, not here.
- `## Acceptance criteria`: each item becomes a test.
- `## Open questions`: what is not decided yet. Write `- None.` when all is decided.

## Example

See `examples/page/business-rules.md`.
