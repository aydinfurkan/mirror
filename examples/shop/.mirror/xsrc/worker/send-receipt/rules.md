**Relates to:** `api/stripe-webhook`
**Inherits:** none
**Supersedes:** none

## Context

A customer pays. They expect an email with the order in a few minutes.

## Goal

- Send one receipt for each paid order.

## Non-goal

- Send marketing email.

## Constraints

- Send the receipt at most one time for each order.

## Acceptance criteria

- Send the receipt for an `order.paid` event.
- Send nothing for a second copy of the same event.
- Send the event to the dead-letter topic after 5 failures.

## Open Questions

- None.
