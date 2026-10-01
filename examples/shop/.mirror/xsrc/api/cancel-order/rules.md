**Relates to:** `web/order-status`, `worker/update-stock`
**Inherits:** none
**Supersedes:** none

## Context

A customer can change their mind after the payment. The shop lets them cancel for 24 hours.

## Goal

- Cancel a paid order and give the money back.
- Tell the worker, so it puts the items back in the stock.

## Non-goal

- Cancel a part of an order.
- Cancel an order that is shipped.

## Constraints

- Cancel only a `paid` order of the last 24 hours.
- Refund with Stripe before the status changes to `cancelled`.
- Publish `order.cancelled` only after the status is saved.

## Acceptance criteria

- Return 200 and set the status `cancelled` for a paid order of the last 24 hours.
- Return 409 for a `pending` or `cancelled` order, or an order older than 24 hours.
- Return 502 and keep the order `paid` when Stripe fails.
- Publish one `order.cancelled` event with the items of the order.

## Open Questions

- Should the customer get an email for the refund?
