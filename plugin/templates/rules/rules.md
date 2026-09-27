# Rule: `rules.md`

Path: `.mirror/xsrc/<project>/<flow-or-page>/rules.md`.

## Sections

- `## Business rules`: a bullet list. Put here the rules that need state or context: for
  example "only the author can delete a post". Put the shape limits in `boundary.md`, not here.
- `## Acceptance criteria`: a bullet list. Each item becomes a test.

## Example

```markdown
## Business rules

- Only the author can delete a post.

## Acceptance criteria

- Delete the post when the author asks.
- Return HTTP 403 when another user asks.
```
