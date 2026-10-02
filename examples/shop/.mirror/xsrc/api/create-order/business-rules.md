**Relates to:** `web/checkout`, `api/stripe-webhook`
**Inherits:** none
**Supersedes:** none

## Context

A customer clicks "Pay" on the checkout page. The shop saves the order and sends the customer to Stripe to pay.

## Goal

- Save an order with the prices of now, not the prices the customer saw before.
- Send the customer to pay.

## Non-goal

- Take the payment. Stripe does it.
- Hold the stock. The stock changes after the payment.

## Constraints

- Use the current price of each item.
- The order is not paid until Stripe confirms the payment.

## Acceptance criteria

- A valid cart creates an order and sends the customer to pay.
- The order total uses the current prices.
- A cart with more items than the stock is refused.
- When Stripe fails, the order stays unpaid and the customer sees an error.

## Open Questions

- Should an unpaid order expire after 24 hours?
