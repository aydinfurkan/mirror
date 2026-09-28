**Relates to:** `web/edit-post`
**Inherits:** `api/create-post` (title and body limits)
**Supersedes:** none

## Context

An author fixes or changes the text of a post.

## Goal

- Change only the fields that the request sets.
- Record the update time. Keep the creation time.

## Non-goal

- Change the author of a post.
- Keep old versions of a post.

## Constraints

- Use the same title and body limits as when a post is created.
- Reject a request that sets no field.

## Acceptance criteria

- Keep each field that the request does not set.
- Set `updatedAt` to the update time.
- Reject a request that sets no field.
- Keep the post unchanged when a field is invalid.
- Report a not-found error for an unknown id.

## Open Questions

- Should only the author be able to update a post?
