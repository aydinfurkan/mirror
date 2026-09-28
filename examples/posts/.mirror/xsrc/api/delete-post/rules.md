**Relates to:** `web/post-detail`
**Inherits:** none
**Supersedes:** none

## Context

An author removes a post that they do not want to show.

## Goal

- Remove the post with the given id.

## Non-goal

- Check who asks for the delete.
- Keep a deleted post for a restore.

## Constraints

- Delete only a post that exists.

## Acceptance criteria

- Remove the post from the repository.
- Return not-found for the post after the delete.
- Report a not-found error for an unknown id.

## Open Questions

- Should only the author be able to delete a post?
