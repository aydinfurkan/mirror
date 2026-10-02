**Relates to:** `web/order-status`, `worker/update-stock`
**Inherits:** none
**Supersedes:** none

## Context

A customer can change their mind after the payment. The shop lets them cancel for 24 hours.

## Goal

- Cancel a paid order and give the money back.
- Put the items of the order back in the stock.

## Non-goal

- Cancel a part of an order.
- Cancel an order that is shipped.

## Constraints

- A customer can cancel only a paid order, and only in the 24 hours after the order.
- Give the money back before the order is cancelled.
- Put the items back in the stock only after the order is cancelled.

## Acceptance criteria

- A paid order of the last 24 hours is cancelled.
- An order that is not paid, is already cancelled, or is older than 24 hours cannot be cancelled.
- When the refund fails, the order stays paid and the customer sees an error.
- The items of a cancelled order go back in the stock one time.

## Open Questions

- Should the customer get an email for the refund?
