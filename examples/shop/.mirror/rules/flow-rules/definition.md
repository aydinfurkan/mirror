# Rule: flow `definition.md`

Path: `.mirror/xsrc/<project>/<flow>/definition.md`. Use it for `backend`, `worker` and
`consumer` flows.

## Sections

- Frontmatter with `trigger` and `entry`.
  - `trigger`: `http`, `main`, `message` or `schedule`.
  - `entry`: the endpoint, script, cron, queue or topic.
  - `group`: optional. A short kebab-case name for flows of the same kind, for example
    `posts` or `auth`. The viewer lists the flows of each group under its name. Flows without a
    group go under `other`.
- One sentence: what the flow does.

## Example

See `.mirror/rules/flow-rules/examples/definition.md`.
