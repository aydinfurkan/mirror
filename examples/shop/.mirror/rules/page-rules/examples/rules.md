**Relates to:** `api/get-user`, `api/update-user`
**Inherits:** none
**Supersedes:** none

## Context

A user changes their own name or email.

## Goal

- Let the user change their name and email.

## Non-goal

- Change the password.

## Constraints

- Show the form only to the user with the given id.

## Acceptance criteria

- Fill the form with the current name and email.
- Open `/users/<id>` after a save.
- Show "User not found." for 404.

## Open Questions

- None.
