# Rule: page `design.md`

Path: `.mirror/xsrc/<project>/<page>/design.md`. The visual design of the page.

## Header

One line at the top: `**Design file:**` and a link to the design (Figma, a screenshot), or
`none`. For an image in the repo, write a Markdown link with the path from the repo root:
`**Design file:** [checkout.png](docs/screens/checkout.png)`. The viewer shows an image file
(`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`) in its own UI part, at the top of the page, before
the actions.

When the line links no image file in the repo, draw the page in `design.svg` next to this file.
See `design-svg.md`.

An `.svg` design is a clickable demo. Put `data-action="<action>"` on the element of each control,
with the header of its action in `actions.md`: `<g data-action="Click &quot;Pay&quot;">`. A click
on the control opens the flow of the first `Call:` of the action, for example `api/create-order`.
When the action has no call, a bullet like ``Then: open `/checkout`.`` opens that page. Else the click shows
the action. The viewer drops scripts, event handlers and links from the SVG.

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

See `examples/page/design.md`.
