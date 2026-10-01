**Relates to:** `web/post-detail`
**Inherits:** none
**Supersedes:** none

## Context

An author removes a post that they do not want to show.

## Goal

- Remove the post with the given id.

## Non-goal

- Keep a deleted post for a restore.

## Constraints

- Only the author can delete a post.

## Acceptance criteria

- Delete the post when the author asks.
- Return HTTP 403 when another user asks.

## Open Questions

- Should an admin be able to delete any post?
