**Relates to:** `api/get-post`, `api/delete-post`, `web/edit-post`
**Inherits:** none
**Supersedes:** none

## Context

A user reads one post, and can edit or delete it.

## Goal

- Show one post.
- Let the user delete it.

## Non-goal

- Show comments.

## Constraints

- Delete a post only after the user confirms it.

## Acceptance criteria

- Show the title as the page heading.
- Send `DELETE /api/posts/<id>` after the confirmation, then show the list without the post.
- Show "Could not find this post." for an unknown id.

## Open Questions

- None.
