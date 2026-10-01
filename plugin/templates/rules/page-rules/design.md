# Rule: page `design.md`

Path: `.mirror/xsrc/<project>/<page>/design.md`. The visual design of the page.

## Header

One line at the top: `**Design file:**` and a link to the design (Figma, a screenshot), or
`none`.

## Sections

In this order. Each section is a bullet list.

- `## Layout`: one bullet per region of the page, from top to bottom. Write the region name,
  then `: ` and what it holds.
- `## Components`: one bullet per main component. Write the component name in backticks, then
  `: ` and what it shows. Name each variant: for example primary and secondary buttons.
- `## States`: one bullet per visual state that is not the normal view: loading, empty, error,
  disabled. Write the state, then `: ` and what the page shows.
- `## Responsive`: what changes on a small screen. Write `- None.` when nothing changes.

## Style

- Write what the reader sees, not the behavior. Put the calls and the results in `actions.md`.
- Name the design tokens or the theme values of the app, not raw values. Write `the primary
  color`, not `#2563eb`.
- Write the text that the page shows in quotes: "Save".

## Example

See `.mirror/rules/page-rules/examples/design.md`.
