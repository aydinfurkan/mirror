## Input

- `GET /posts`, with the optional query `?authorId=<id>`.

## Output

- HTTP 200 with an array of posts. The array can be empty.
- HTTP 500 with `{ error: { code: "unexpected", field: "server", message } }`.

## Dependencies

- `PostRepository.findAll` (in memory).
