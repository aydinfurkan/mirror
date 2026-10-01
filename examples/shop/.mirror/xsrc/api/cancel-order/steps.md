## 1. Read the order
- Return HTTP 404 when it does not exist.
- Return HTTP 409 when it is not `paid` or is older than 24 hours.
- Code: `src/orders/orders.repo.ts#findOrder`

## 2. Refund the payment with Stripe
- Return HTTP 502 when Stripe does not answer.
- Code: `src/payments/stripe.client.ts#refundPayment`

## 3. Save the order with the status `cancelled`
- Code: `src/orders/orders.repo.ts#cancelOrder`

## 4. Publish `order.cancelled` with the items of the order
- Code: `src/events/order-events.ts#publishOrderCancelled`

## 5. Return the order id and the new status
- Code: `src/orders/orders.route.ts#cancelOrder`
