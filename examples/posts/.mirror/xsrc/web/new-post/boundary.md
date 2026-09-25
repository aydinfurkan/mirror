## Input

Route `/posts/new`, form fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `title` | text | yes | Checked by the API. |
| `body` | text | yes | Checked by the API. |
| `authorId` | text | yes | Checked by the API. |

## Output

| Result | Shows | When |
| --- | --- | --- |
| Go to `/posts/<new id>` | The new post. | The API creates the post. |
| Alert on the form | The API error message. | The API rejects the post. |
| Alert on the form | "Could not reach the server." | The request fails. |

## Dependencies

- `POST /api/posts` (flow `api/create-post`).
