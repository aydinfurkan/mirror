# Rule: flow or page `definition.md`

Path: `.mirror/xsrc/<project>/<flow-or-page>/definition.md`.

## Sections

- Frontmatter with `trigger` and `entry`.
  - `trigger`: `http`, `main`, `message`, `schedule` or `page`.
  - `entry`: the endpoint, script, cron, queue or topic, or route path.
- One sentence: what the flow or page does.

## Example

```markdown
---
trigger: http
entry: POST /users
---
Create a user account.
```
