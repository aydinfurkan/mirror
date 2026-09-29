**Relates to:** `api/get-product`, `web/cart`
**Inherits:** none
**Supersedes:** none

## Context

A customer reads about one product and decides to buy it.

## Goal

- Let the customer add the product to the cart.

## Non-goal

- Save the cart on the server.

## Constraints

- Do not let the cart quantity be more than the stock that the page shows.

## Acceptance criteria

- Add the product to the cart in `localStorage`.
- Add to the quantity when the product is already in the cart.
- Show "Product not found." for 404.

## Open Questions

- None.
