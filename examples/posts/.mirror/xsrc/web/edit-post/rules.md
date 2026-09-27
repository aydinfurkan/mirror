## Business rules

- Do not let the user change the author of a post.
- Let the API validate the change. Show its message to the user.

## Acceptance criteria

- Fill the form with the current title and body.
- Send `PATCH /api/posts/<id>`, then show the post with the new title.
