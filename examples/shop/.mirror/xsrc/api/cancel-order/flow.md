## Input

- None.

## 1. Read the order
- Fail: return HTTP 404 when it does not exist.
- Fail: return HTTP 409 when it is not `paid` or is older than 24 hours.

## 2. Refund the payment with Stripe
- Fail: return HTTP 502 when Stripe does not answer.

## 3. Save the order with the status `cancelled`

## 4. Publish `order.cancelled` with the items of the order

## 5. Return the order id and the new status

## Output

Example (200):

```json
{ "id": "o1", "status": "cancelled" }
```

Example (409):

```json
{ "error": { "code": "conflict", "message": "Only a paid order of the last 24 hours can be cancelled." } }
```
