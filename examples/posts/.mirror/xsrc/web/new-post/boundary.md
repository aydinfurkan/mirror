## Input

- Route `/posts/new`.
- The title, the body and the author id that the user types.

## Output

- A move to `/posts/<new id>` after the create.
- An alert on the form with the API message when the create fails.

## Dependencies

- `POST /api/posts` (flow `api/create-post`).
