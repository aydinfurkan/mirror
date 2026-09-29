**Relates to:** `web/order-status`
**Inherits:** none
**Supersedes:** none

## Context

A customer comes back from Stripe and wants to know if the order is paid.

## Goal

- Return the status, the total and the items of the order.

## Non-goal

- Check who asks. The order id is long and random.

## Constraints

- Return only the email domain, not the full email.

## Acceptance criteria

- Return the order for a known id.
- Return HTTP 404 for an unknown id.

## Open Questions

- Should the page need a token from the email to see the order?
