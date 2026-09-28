**Relates to:** none
**Inherits:** none
**Supersedes:** none

## Context

A load balancer or a person checks that the API runs.

## Goal

- Tell the caller that the API runs.

## Non-goal

- Check the repository or other dependencies.

## Constraints

- Answer without a call to the repository.

## Acceptance criteria

- `GET /health` returns HTTP 200 with `{ "status": "ok" }`.

## Open Questions

- None.
