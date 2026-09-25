## Input

Route `/posts/:id`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `id` (route) | text | yes | — |
| Delete confirmation | yes / no | yes | The delete runs only on yes. |

## Output

| Result | Shows | When |
| --- | --- | --- |
| Post | Title, author, update time, body, and an "Edit" link to `/posts/:id/edit`. | The post loads. |
| Go to `/` | The list. | The API deletes the post. |
| Alert | "Could not find this post." | The post does not exist. |
| Alert | "Could not delete this post." | The delete fails. |

## Dependencies

- `GET /api/posts/:id` (flow `api/get-post`).
- `DELETE /api/posts/:id` (flow `api/delete-post`).
