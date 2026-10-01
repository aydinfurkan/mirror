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

- Apply each event at most one time.
- The stock can go below 0 when two customers pay for the last item. A person then fixes it.

## Acceptance criteria

- Lower the stock for an `order.paid` event.
- Raise the stock for an `order.cancelled` event.
- Change nothing for a second copy of the same event.
- Change all items or none.

## Open Questions

- Should the worker alert a person when the stock goes below 0?
