## Input

- Route `/posts/:id/edit`.
- The title and the body that the user types.

## Output

- A move to `/posts/:id` after the save.
- An alert on the form with the API message when the save fails.
- An alert when the post does not exist.

## Dependencies

- `GET /api/posts/:id` (flow `api/get-post`).
- `PATCH /api/posts/:id` (flow `api/update-post`).
