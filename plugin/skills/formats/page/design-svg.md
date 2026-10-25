# Rule: page `design.svg`

Path: `.mirror/xsrc/<project>/<page>/design.svg`. A wireframe of the page. The viewer shows it
as a clickable demo.

## When to write it

- Write it for each page, when `design.md` has no image file on its `**Design file:**` line:
  `none`, or a link to Figma or another site. Draw it from `design.md` and `actions.md`.
- When `design.md` links an image file in the repo, do not write it. The viewer shows that file.
- When you change `design.md` or the headers of `actions.md`, change `design.svg` to match.

## Drawing

- The root: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 H">`, with `H` the height
  that the page needs. Add a `<title>` with the page name.
- Draw the normal view of the page, as on a wide screen. Do not draw the other states.
- Draw each region of `## Layout` in its order, from top to bottom.
- Draw each component of `## Components` with plain shapes: `rect`, `line`, `path`, `circle`
  and `text`. Draw an image as a gray box with a cross.
- Write the text that `design.md` puts in quotes, as the page shows it. Use short sample data
  for the rest, for example a name and a price.
- Use the colors of the app when the code shows them. Else use gray shapes on a light
  background and the primary color for the primary button.
- Use `font-family="ui-sans-serif, system-ui, sans-serif"` on the root.
- Do not use `script`, `style`, `foreignObject`, `image`, links, event handlers or external
  files. The viewer removes them.

## Controls

- Put each control that starts an action of `actions.md` in a `<g>` with
  `data-action="<the header of the action>"`. Write `&quot;` for a `"` in the header:
  `<g data-action="Click &quot;Save&quot;">`.
- Put the whole control in the group: its shape and its text.
- Do not mark the `Open the page` action. It has no control.
- One action can have many controls, for example each card of a list.

## Link

Do not change the `**Design file:**` line of `design.md`. The build finds `design.svg` in the
folder of the page.

## Example

See `examples/page/design.svg`.
