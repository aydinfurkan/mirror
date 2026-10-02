**Relates to:** `web/order-status`
**Inherits:** none
**Supersedes:** none

## Context

A customer comes back from the payment and wants to know if the order is paid.

## Goal

- Show the status, the total and the items of the order.

## Non-goal

- Check who asks. The order number is long and hard to guess.

## Constraints

- Show only the domain of the customer email, not the full email.

## Acceptance criteria

- A customer sees an order that exists.
- A customer sees "not found" for an order that does not exist.

## Open Questions

- Should the customer need a link from the email to see the order?
