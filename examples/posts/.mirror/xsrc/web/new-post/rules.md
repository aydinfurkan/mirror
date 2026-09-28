**Relates to:** `api/create-post`
**Inherits:** none
**Supersedes:** none

## Context

A user writes a post in the browser.

## Goal

- Let the user write and create a post.

## Non-goal

- Save a draft.
- Check the fields in the browser before the API does.

## Constraints

- Let the API validate the post. Show its message to the user.
- Disable the submit button while the request runs.

## Acceptance criteria

- Open the new post after a create.
- Show "Enter a title." and stay on the form when the title is empty.

## Open Questions

- Should the author id come from a login instead of a text field?
