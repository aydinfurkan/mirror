## 1. Check the Stripe signature of the request
- Return HTTP 400 when the signature is not valid.
- Code: `src/payments/stripe.webhook.ts#verifyEvent`

## 2. Skip each event that is not `checkout.session.completed`
- Return HTTP 200 for it.
- Code: `src/payments/stripe.webhook.ts#handleEvent`

## 3. Set the status of the order to `paid`
- Do nothing when the order is already `paid`.
- Code: `src/orders/orders.repo.ts#markPaid`

## 4. Publish `order.paid` to `order.events`
- Code: `src/orders/orders.events.ts#publishOrderPaid`
