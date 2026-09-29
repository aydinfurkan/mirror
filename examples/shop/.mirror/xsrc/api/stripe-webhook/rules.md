**Relates to:** `api/create-order`, `worker/send-receipt`, `worker/update-stock`
**Inherits:** none
**Supersedes:** none

## Context

Stripe calls this endpoint after a customer pays. It is the only place that marks an order paid.

## Goal

- Mark the order paid one time, and tell the worker.

## Non-goal

- Handle refunds. A person does them in the Stripe dashboard.

## Constraints

- Accept only requests with a valid Stripe signature.
- Stripe can send the same event more than one time.

## Acceptance criteria

- Mark a `pending` order `paid` for `checkout.session.completed`.
- Publish one `order.paid` event per order, also when Stripe sends the event two times.
- Return 400 for a bad signature and change nothing.
- Return 200 for other event types and change nothing.

## Open Questions

- None.
