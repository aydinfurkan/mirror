**Relates to:** `api/get-product`, `app/cart`
**Inherits:** none
**Supersedes:** none

## Context

A customer looks at one product before they buy it.

## Goal

- Let the customer add the product to the cart.

## Non-goal

- Reserve the stock. The shop checks it when it creates the order.

## Constraints

- Do not add a product with a stock of 0.

## Acceptance criteria

- Add one item to the cart for each tap on "Add to cart".
- Disable "Add to cart" when the stock is 0.

## Open questions

- None.
