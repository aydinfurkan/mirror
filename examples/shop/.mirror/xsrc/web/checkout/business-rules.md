**Relates to:** `api/create-order`, `web/order-status`
**Inherits:** none
**Supersedes:** none

## Context

A customer is ready to pay. The shop hands the payment to Stripe.

## Goal

- Create the order and send the customer to the Stripe payment page.

## Non-goal

- Take a card number. Stripe does it.

## Constraints

- Keep the cart until the order is paid. The customer can come back and try again.

## Acceptance criteria

- Send the customer to the Stripe payment page after the order is created.
- Tell the customer when the stock is too low for the cart.
- Keep the cart when the payment fails.

## Open questions

- None.
