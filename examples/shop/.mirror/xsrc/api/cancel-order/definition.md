---
trigger: http
entry: POST /orders/:id/cancel
group: orders
---
Cancel a paid order, refund the payment with Stripe, and tell the other services.
