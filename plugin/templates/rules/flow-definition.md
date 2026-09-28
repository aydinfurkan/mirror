# Rule: flow or page `definition.md`

Path: `.mirror/xsrc/<project>/<flow-or-page>/definition.md`.

## Sections

- Frontmatter with `trigger` and `entry`.
  - `trigger`: `http`, `main`, `message`, `schedule` or `page`.
  - `entry`: the endpoint, script, cron, queue or topic, or route path.
  - `group`: optional. A short kebab-case name for flows of the same kind, for example
    `posts` or `auth`. The graph shows each group in one box. Flows without a group go in
    an `other` box.
- One sentence: what the flow or page does.

## Example

See `.mirror/rules/examples/flow-definition.md`.
