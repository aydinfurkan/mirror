**Relates to:** `web/products`
**Inherits:** none
**Supersedes:** none

## Context

A customer opens the shop. The page shows all the products that are for sale.

## Goal

- Return each active product with its price and its stock.

## Non-goal

- Filter or page the list. The shop has few products.

## Constraints

- Do not return a product with `active` set to false.
- A price change can take up to 60 seconds to show.

## Acceptance criteria

- Return the active products sorted by name.
- Return an empty list when no product is active.
- Return the cached list without a database read when the cache has it.

## Open Questions

- None.
