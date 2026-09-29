**Relates to:** `api/create-order`, `web/order-status`
**Inherits:** none
**Supersedes:** none

## Context

A customer is ready to pay. The shop hands the payment to Stripe.

## Goal

- Create the order and open the Stripe payment page.

## Non-goal

- Take a card number. Stripe does it.

## Constraints

- Keep the cart until the order is paid. The customer can come back and try again.

## Acceptance criteria

- Open Stripe Checkout with the session id from the API.
- Show the error of the API for 409.
- Keep the cart when the payment fails.

## Open Questions

- None.
