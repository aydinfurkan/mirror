**Relates to:** `api/get-post`, `api/update-post`
**Inherits:** `web/new-post` (the form and its error messages)
**Supersedes:** none

## Context

A user changes the title and the body of a post in the browser.

## Goal

- Let the user change the title and the body of a post.

## Non-goal

- Let the user change the author of a post.

## Constraints

- Let the API validate the change. Show its message to the user.

## Acceptance criteria

- Fill the form with the current title and body.
- Send `PATCH /api/posts/<id>`, then show the post with the new title.

## Open Questions

- None.
