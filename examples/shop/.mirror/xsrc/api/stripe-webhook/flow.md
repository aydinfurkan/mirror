## Input

Example:

```json
{ "id": "evt_1", "type": "checkout.session.completed", "data": { "object": { "id": "cs_test_a1b2", "metadata": { "orderId": "o1" } } } }
```

## 1. Check the Stripe signature of the request
- Fail: return HTTP 400 when the signature is not valid.

## 2. Skip each event that is not `checkout.session.completed`
- Return HTTP 200 for it.

## 3. Set the status of the order to `paid`
- Do nothing when the order is already `paid`.

## 4. Publish `order.paid` to `order.events`

## Output

Example (published):

```json
{ "eventId": "evt_1", "type": "order.paid", "orderId": "o1", "email": "ada@example.com", "items": [{ "productId": "p1", "quantity": 2 }] }
```

Example (400):

```json
{ "error": { "code": "signature", "message": "Invalid signature." } }
```
