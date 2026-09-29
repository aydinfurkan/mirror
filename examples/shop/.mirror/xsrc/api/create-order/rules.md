**Relates to:** `web/checkout`, `api/stripe-webhook`
**Inherits:** none
**Supersedes:** none

## Context

A customer clicks "Pay" on the checkout page. The API saves the order and sends the customer to Stripe.

## Goal

- Save an order with the prices of now, not the prices in the browser.
- Give the page a Stripe session to pay.

## Non-goal

- Take the payment. Stripe does it.
- Reserve the stock. The worker changes the stock after the payment.

## Constraints

- Use the price from the database for each item.
- Keep the order `pending` until Stripe confirms the payment.

## Acceptance criteria

- Return 201 with an order id and a session id for a valid cart.
- Save the order total from the database prices.
- Return 409 when a quantity is more than the stock.
- Return 502 and keep the order `pending` when Stripe fails.

## Open Questions

- Should a `pending` order expire after 24 hours?
