**Relates to:** `api/stripe-webhook`, `api/cancel-order`
**Inherits:** none
**Supersedes:** none

## Context

The stock must show what is left after each paid order, so the shop does not sell what it does not have.

## Goal

- Lower the stock by the paid quantity of each item.
- Raise the stock by the quantity of each item of a cancelled order.

## Non-goal

- Reorder products from a supplier.

## Constraints

- Change the stock only one time for each payment and each cancel.
- The stock can go below 0 when two customers pay for the last item. A person then fixes it.

## Acceptance criteria

- Lower the stock when an order is paid.
- Raise the stock when an order is cancelled.
- Change nothing when the shop hears about the same payment or cancel again.
- Change all items of the order or none.

## Open questions

- Should the shop alert a person when the stock goes below 0?
