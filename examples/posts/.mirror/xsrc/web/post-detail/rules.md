- Delete a post only after the user confirms it.

## Acceptance criteria

- Show the title as the page heading.
- Send `DELETE /api/posts/<id>` after the confirmation, then show the list without the post.
- Show "Could not find this post." for an unknown id.
