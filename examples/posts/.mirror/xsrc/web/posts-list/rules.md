- Show the posts in the order that the API returns: newest first.
- Keep the author filter in the URL, so a user can share the filtered list.

## Acceptance criteria

- Show a link to `/posts/<id>` for each post.
- Request `GET /api/posts?authorId=<id>` when the URL has an author id.
- Show "No posts yet." when the API returns an empty list.
