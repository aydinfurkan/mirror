## Input

- `PATCH /posts/:id` with the JSON body `{ "title"?: string, "body"?: string }`. At least one field is set.

## Output

- HTTP 200 with the updated post.
- HTTP 400 with `{ error: { code: "validation", field, message } }`.
- HTTP 404 with `{ error: { code: "not-found", field: "id", message } }`.
- HTTP 500 with `{ error: { code: "unexpected", field: "server", message } }`.

## Dependencies

- `PostRepository.findById` and `PostRepository.save` (in memory).
- `now()` from `src/infra/system.deps.ts`.
