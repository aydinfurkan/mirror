**Relates to:** `web/new-post`
**Inherits:** none
**Supersedes:** none

## Context

An author writes a post in the web app. The API stores it in memory.

## Goal

- Create a post when a user supplies a title, a body and an author id.
- Give the post a unique id. Record the creation time.

## Non-goal

- Check that the author exists.
- Keep the posts after a restart.

## Constraints

- Reject a title that contains no visible characters or is longer than 120 characters.
- Reject a body that contains no visible characters or is longer than 10000 characters.

## Acceptance criteria

- Return the new post with `updatedAt` equal to `createdAt`.
- Store the new post in the repository.
- Accept a title of exactly 120 characters.
- Reject a title of 121 characters.
- Reject an empty body.
- Store nothing when the input is invalid.

## Open Questions

- None.
