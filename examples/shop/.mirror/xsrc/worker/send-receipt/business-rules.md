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

- Send the receipt when an order is paid.
- Send nothing when the shop hears about the same payment again.
- After 5 failed tries, put the receipt aside for a person to check.

## Open Questions

- None.
