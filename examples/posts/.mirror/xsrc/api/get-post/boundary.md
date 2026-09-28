## Input

`GET /posts/:id`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `id` (path) | string | yes | — |

## Output

| Status | Body | When |
| --- | --- | --- |
| 200 | `Post` | The post exists. |
| 404 | `{ error: { code: "not-found", field: "id", message } }` | No post has this id. |
| 500 | `{ error: { code: "unexpected", field: "server", message } }` | The server fails. |

Example (200):

```json
{
  "id": "p1",
  "title": "Hello",
  "body": "My first post.",
  "authorId": "u1",
  "createdAt": "2026-09-27T10:00:00.000Z",
  "updatedAt": "2026-09-27T10:00:00.000Z"
}
```

Example (404):

```json
{ "error": { "code": "not-found", "field": "id", "message": "Find no post with this id." } }
```

## Dependencies

- `PostRepository.findById` (in memory).
