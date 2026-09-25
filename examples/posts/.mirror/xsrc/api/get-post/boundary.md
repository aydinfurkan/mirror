## Input

- `GET /posts/:id`.

## Output

- HTTP 200 with the post.
- HTTP 404 with `{ error: { code: "not-found", field: "id", message } }`.
- HTTP 500 with `{ error: { code: "unexpected", field: "server", message } }`.

## Dependencies

- `PostRepository.findById` (in memory).
