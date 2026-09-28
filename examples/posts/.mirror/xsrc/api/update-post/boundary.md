## Input

`PATCH /posts/:id`, JSON body with at least one of `title` and `body`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `id` (path) | string | yes | — |
| `title` | string | no | 1–120 characters, at least one visible character |
| `body` | string | no | 1–10000 characters, at least one visible character |

Example:

```json
{ "title": "Hello again" }
```

## Output

| Status | Body | When |
| --- | --- | --- |
| 200 | `Post` with a new `updatedAt` | The post is updated. |
| 400 | `{ error: { code: "validation", field, message } }` | No field is set, or a field fails its validation. |
| 404 | `{ error: { code: "not-found", field: "id", message } }` | No post has this id. |
| 500 | `{ error: { code: "unexpected", field: "server", message } }` | The server fails. |

Example (200):

```json
{
  "id": "p1",
  "title": "Hello again",
  "body": "My first post.",
  "authorId": "u1",
  "createdAt": "2026-09-27T10:00:00.000Z",
  "updatedAt": "2026-09-27T11:00:00.000Z"
}
```

Example (404):

```json
{ "error": { "code": "not-found", "field": "id", "message": "Find no post with this id." } }
```

## Dependencies

- `PostRepository.findById` and `PostRepository.save` (in memory).
- `now()` from `src/infra/system.deps.ts`.
