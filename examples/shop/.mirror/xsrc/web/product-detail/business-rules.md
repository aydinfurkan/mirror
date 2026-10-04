**Relates to:** `api/get-product`, `web/cart`
**Inherits:** none
**Supersedes:** none

## Context

A customer reads about one product and decides to buy it.

## Goal

- Let the customer add the product to the cart.

## Non-goal

- Keep the cart for the customer on another device.

## Constraints

- Do not let the cart quantity be more than the stock that the page shows.

## Acceptance criteria

- Add the product to the cart. The cart is still there when the customer comes back on the same device.
- Add to the quantity when the product is already in the cart.
- Show "Product not found." for a product that does not exist.

## Open questions

- None.
