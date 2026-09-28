## Input

`GET /posts`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `authorId` (query) | string | no | Ignored when it is not a single string. |

## Output

| Status | Body | When |
| --- | --- | --- |
| 200 | `Post[]`, newest first, can be empty | Always, unless the server fails. |
| 500 | `{ error: { code: "unexpected", field: "server", message } }` | The server fails. |

Example (200):

```json
[
  {
    "id": "p1",
    "title": "Hello",
    "body": "My first post.",
    "authorId": "u1",
    "createdAt": "2026-09-27T10:00:00.000Z",
    "updatedAt": "2026-09-27T10:00:00.000Z"
  }
]
```

## Dependencies

- `PostRepository.findAll` (in memory).
