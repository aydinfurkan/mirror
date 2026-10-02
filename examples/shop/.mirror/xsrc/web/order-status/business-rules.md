**Relates to:** `api/get-order`, `api/cancel-order`, `web/checkout`
**Inherits:** none
**Supersedes:** none

## Context

Stripe sends the customer back to the shop. The payment confirmation can come a few seconds after the customer.

## Goal

- Show the customer that the order is paid.
- Let the customer cancel a paid order for 24 hours.

## Non-goal

- Show the delivery status.

## Constraints

- Do not mark the order paid on this page. Only the payment confirmation from Stripe does it.

## Acceptance criteria

- Show "Paid" for a paid order.
- Keep checking for a short time while the order waits for the payment. Then ask the customer to check their email.
- Empty the cart when the order is paid.
- Show "Cancel order" only for a paid order of the last 24 hours.
- Ask the customer to confirm before the cancel.

## Open Questions

- None.
