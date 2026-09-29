## Input

Route `/posts/:id/edit`, form fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `id` (route) | text | yes | — |
| `title` | text | yes | Checked by the API. |
| `body` | text | yes | Checked by the API. |

Example:

```json
{ "title": "Hello again", "body": "Updated text." }
```

## Output

| Result | Shows | When |
| --- | --- | --- |
| Form | The current title and body. | The post loads. |
| Go to `/posts/:id` | The updated post. | The API saves the change. |
| Alert on the form | The API error message. | The API rejects the change. |
| Alert | "Could not find this post." | The post does not exist. |

## Dependencies

- calls `api/get-post`: `GET /api/posts/:id` to fill the form.
- calls `api/update-post`: `PATCH /api/posts/:id` with the changed fields.
