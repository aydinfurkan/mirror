## Input

`POST /webhooks/stripe`, header `Stripe-Signature`, JSON body: a Stripe event.

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `type` | string | yes | Stripe event type |
| `data.object.metadata.orderId` | string | yes | for `checkout.session.completed` |

Example:

```json
{ "id": "evt_1", "type": "checkout.session.completed", "data": { "object": { "id": "cs_test_a1b2", "metadata": { "orderId": "o1" } } } }
```

## Output

| Status | Body | When |
| --- | --- | --- |
| 200 | `{ received: true }` | The event is handled or skipped. |
| 400 | `{ error: { code: "signature", message } }` | The signature is not valid. |
| Publish `order.paid` | `{ eventId, orderId, email, items }` | The order changes to `paid`. |

Example (published):

```json
{ "eventId": "evt_1", "type": "order.paid", "orderId": "o1", "email": "ada@example.com", "items": [{ "productId": "p1", "quantity": 2 }] }
```

Example (400):

```json
{ "error": { "code": "signature", "message": "Invalid signature." } }
```

## Dependencies

- writes `shop-db`: the order status `paid`.
- publishes `order-events`: the event `order.paid`.
