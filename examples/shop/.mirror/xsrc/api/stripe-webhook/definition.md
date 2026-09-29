---
trigger: http
entry: POST /webhooks/stripe
group: payments
---
Mark an order paid when Stripe says that the payment is complete.
