# Rule: page `design.md`

Path: `.mirror/xsrc/<project>/<page>/design.md`. The visual design of the page.

## Wireframe

Draw the page in `ui/main/design.svg`, and each variant in `ui/<variant>/design.svg`. See
`design-svg.md`. The viewer shows them as clickable demos, at the top of the page, before the
actions. Draw the components of each view in their variations in `ui/<view>/variations.svg`.
See `variations-svg.md`.

## Sections

In this order. Each section is a bullet list.

- `## Layout`: one bullet per region of the page, from top to bottom. Write the region name,
  then `: ` and what it holds.
- `## Components`: one bullet per main component. Write the component name in backticks, then
  `: ` and what it shows. Name each variation: for example primary and secondary, or default,
  hover, disabled and loading. Use the same names in `variations.svg`.
- `## States`: one bullet per visual state that is not the normal view: loading, empty, error,
  disabled. Write the state, then `: ` and what the page shows.
- `## Variants`: one bullet per `ui/<variant>/` folder. Write the variant name in backticks,
  then `: ` and when the page shows it: ``- `guest`: the user is not signed in. No "Cancel" button.``
  Skip the section when the page has no variant. See "Variants" in `design-svg.md`.
- `## Responsive`: what changes on a small screen. Write `- None.` when nothing changes.

## Style

- Write what the reader sees, not the behavior. Put the calls and the results in `actions.md`.
- Name the design tokens or the theme values of the app, not raw values. Write `the primary
  color`, not `#2563eb`.
- Write the text that the page shows in quotes: "Save".

## Example

See `examples/page/design.md`.
