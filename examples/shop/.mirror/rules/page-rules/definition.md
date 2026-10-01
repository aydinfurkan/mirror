# Rule: page `definition.md`

Path: `.mirror/xsrc/<project>/<page>/definition.md`. Use it for the pages of `frontend` and
`expo` projects.

## Sections

- Frontmatter with `trigger` and `entry`.
  - `trigger`: `page`.
  - `entry`: the route path.
  - `group`: optional. A short kebab-case name for pages of the same kind, for example
    `browse` or `account`. The viewer lists the pages of each group under its name. Pages
    without a group go under `other`.
- One sentence: what the page does.

## Example

See `.mirror/rules/page-rules/examples/definition.md`.
