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

## Dependencies

- `PostRepository.findAll` (in memory).
