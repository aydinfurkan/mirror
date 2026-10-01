**Relates to:** `api/get-order`, `api/cancel-order`, `web/checkout`
**Inherits:** none
**Supersedes:** none

## Context

Stripe sends the customer back to the shop. The webhook can come a few seconds after the customer.

## Goal

- Show the customer that the order is paid.
- Let the customer cancel a paid order for 24 hours.

## Non-goal

- Show the delivery status.

## Constraints

- Do not mark the order paid in the browser. Only the webhook does it.

## Acceptance criteria

- Show "Paid" for a paid order.
- Ask again while the order is `pending`, at most 10 times.
- Clear the cart when the order is paid.
- Show "Cancel order" only for a paid order of the last 24 hours.
- Ask the customer to confirm before the cancel.

## Open Questions

- None.
