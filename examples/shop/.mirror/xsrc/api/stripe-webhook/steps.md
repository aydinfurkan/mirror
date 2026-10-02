## 1. Check the Stripe signature of the request
- Return HTTP 400 when the signature is not valid.

## 2. Skip each event that is not `checkout.session.completed`
- Return HTTP 200 for it.

## 3. Set the status of the order to `paid`
- Do nothing when the order is already `paid`.

## 4. Publish `order.paid` to `order.events`
