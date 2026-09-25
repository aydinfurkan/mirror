## Input

- `POST /posts` with the JSON body `{ "title": string, "body": string, "authorId": non-empty string }`.

## Output

- HTTP 201 with `{ id, title, body, authorId, createdAt, updatedAt }`. `updatedAt` equals `createdAt`.
- HTTP 400 with `{ error: { code: "validation", field, message } }`.
- HTTP 500 with `{ error: { code: "unexpected", field: "server", message } }`.

## Dependencies

- `PostRepository.save` (in memory).
- `now()` and `newId()` from `src/infra/system.deps.ts`.
