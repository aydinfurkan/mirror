## Input

- Route `/posts/:id`.
- A click on "Delete", and the answer to the confirmation.

## Output

- The post: title, author, update time and body.
- An "Edit" link to `/posts/:id/edit`.
- A move to `/` after a delete.
- An alert when the post does not exist or the delete fails.

## Dependencies

- `GET /api/posts/:id` (flow `api/get-post`).
- `DELETE /api/posts/:id` (flow `api/delete-post`).
