**Relates to:** `api/list-posts`, `web/post-detail`, `web/new-post`
**Inherits:** none
**Supersedes:** none

## Context

The home page of the web app. A user finds a post to read.

## Goal

- Show the list of posts.
- Let the user filter it by author.

## Non-goal

- Split the list into pages.

## Constraints

- Show the posts in the order that the API returns: newest first.
- Keep the author filter in the URL, so a user can share the filtered list.

## Acceptance criteria

- Show a link to `/posts/<id>` for each post.
- Request `GET /api/posts?authorId=<id>` when the URL has an author id.
- Show "No posts yet." when the API returns an empty list.

## Open Questions

- None.
