**Relates to:** `api/create-order`, `app/product`
**Inherits:** none
**Supersedes:** none

## Context

A customer pays for the cart without leaving the app.

## Goal

- Create the order and take the payment in the Stripe payment sheet.

## Non-goal

- Take a card number. Stripe does it.

## Constraints

- Keep the cart until the order is paid.

## Acceptance criteria

- Clear the cart after a paid order.
- Keep the cart when the payment fails.
- Disable "Pay" when the cart is empty.

## Open questions

- None.
