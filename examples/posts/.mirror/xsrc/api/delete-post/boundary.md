## Input

`DELETE /posts/:id`, no body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `id` (path) | string | yes | — |

## Output

| Status | Body | When |
| --- | --- | --- |
| 204 | none | The post is deleted. |
| 404 | `{ error: { code: "not-found", field: "id", message } }` | No post has this id. |
| 500 | `{ error: { code: "unexpected", field: "server", message } }` | The server fails. |

## Dependencies

- `PostRepository.remove` (in memory).
