## Input

Route `/`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `authorId` (query and text field) | text | no | An empty value shows all posts. |

Example:

```text
/?authorId=u1
```

## Output

| Result | Shows | When |
| --- | --- | --- |
| List | Each post as a link to `/posts/:id`, and a "New post" link to `/posts/new`. | The posts load. |
| Text | "Loading…" | The posts are loading. |
| Text | "No posts yet." | The list is empty. |
| Alert | "Could not load the posts." | The request fails. |

## Dependencies

- calls `api/list-posts`: `GET /api/posts` to show the list.
