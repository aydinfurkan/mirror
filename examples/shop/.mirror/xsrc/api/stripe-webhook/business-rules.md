**Relates to:** `api/create-order`, `worker/send-receipt`, `worker/update-stock`
**Inherits:** none
**Supersedes:** none

## Context

Stripe tells the shop when a customer pays. It is the only way an order becomes paid.

## Goal

- Mark the order paid one time.
- Start the receipt and the stock change.

## Non-goal

- Handle refunds. A person does them in Stripe.

## Constraints

- Trust only a message that really comes from Stripe.
- Stripe can send the same payment more than one time.

## Acceptance criteria

- An unpaid order becomes paid when Stripe confirms the payment.
- The receipt and the stock change happen one time per order, also when Stripe sends the payment two times.
- A message that does not come from Stripe changes nothing.
- Other news from Stripe changes nothing.

## Open Questions

- None.
