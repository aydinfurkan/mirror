## Input

- Route `/`, with the optional query `?authorId=<id>`.
- The author id that the user types.

## Output

- A list of posts. Each post links to `/posts/:id`.
- A "New post" link to `/posts/new`.
- "Loading…" while the posts load. "No posts yet." for an empty list. An alert when the load fails.

## Dependencies

- `GET /api/posts` (flow `api/list-posts`).
