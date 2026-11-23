# Rule: page `variations.svg`

Path: `.mirror/xsrc/<project>/<page>/ui/<view>/variations.svg`. The components of one view of
the page, each in its variations: a button in its default, hover, disabled and loading look, an
input when it is empty, filled, in focus and with an error. The viewer shows them under the demo
of the view, one box per component.

## When to write it

- Write it for a view that has components with more than one look. Skip it when no component of
  the view changes its look.
- Draw only the components that the view shows. A component that looks different in another
  view goes in the `variations.svg` of that view: for example the gray status badge in
  `ui/waiting/variations.svg`.
- Name each component and each variation as `## Components` of `design.md` names them.
- When you change a component in `design.md` or in `design.svg`, change its variations too.

## Drawing

- The root: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 W H">`, with
  `font-family="ui-sans-serif, system-ui, sans-serif"` and a `<title>`. Use a white background.
- Put each variation in a `<g data-variation="<Component>: <variation>">`, for example
  `<g data-variation="Button &quot;Pay&quot;: disabled">`. Write `&quot;` for a `"`.
  `<Component>` is the name in backticks in `## Components`, then an optional label of the
  instance, like `"Pay"` or `email`. Keep the variations of one component next to each other.
- Draw the component at the size of `design.svg`, with the colors and the text that the page
  shows. Leave 20 or more units between two groups. The viewer cuts each group out by its box,
  so a group must not hold a shape of another group.
- Draw only the component, not the page around it. A label or an error line of a field is part
  of the field.
- Do not put a `transform` on a group or on a parent of a group.
- Do not use `data-action`. Do not use `script`, `style`, `foreignObject`, `image`, links, event
  handlers or external files. The viewer removes them.

## Example

See `examples/page/variations.svg.md`.
