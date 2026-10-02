## 1. Read the order
- Return HTTP 404 when it does not exist.
- Return HTTP 409 when it is not `paid` or is older than 24 hours.

## 2. Refund the payment with Stripe
- Return HTTP 502 when Stripe does not answer.

## 3. Save the order with the status `cancelled`

## 4. Publish `order.cancelled` with the items of the order

## 5. Return the order id and the new status
