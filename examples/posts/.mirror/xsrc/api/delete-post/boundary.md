## Input

- `DELETE /posts/:id`. No body.

## Output

- HTTP 204 with no body.
- HTTP 404 with `{ error: { code: "not-found", field: "id", message } }`.
- HTTP 500 with `{ error: { code: "unexpected", field: "server", message } }`.

## Dependencies

- `PostRepository.remove` (in memory).
