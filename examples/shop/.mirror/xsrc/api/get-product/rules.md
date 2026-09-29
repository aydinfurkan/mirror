**Relates to:** `web/product-detail`
**Inherits:** none
**Supersedes:** none

## Context

A customer opens one product to read about it before they add it to the cart.

## Goal

- Return the product with its description, price and stock.

## Non-goal

- Return the reviews of the product.

## Constraints

- Do not return a product with `active` set to false.

## Acceptance criteria

- Return the product when it is active.
- Return HTTP 404 for an unknown id.
- Return HTTP 404 for a product that is not active.

## Open Questions

- None.
