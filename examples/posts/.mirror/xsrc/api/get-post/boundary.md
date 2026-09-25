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

## Dependencies

- `PostRepository.findById` (in memory).
