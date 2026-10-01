## Input

`POST /orders/:id/cancel`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `id` | path string | yes | not empty |

## Output

| Status | Body | When |
| --- | --- | --- |
| 200 | `{ id, status: "cancelled" }` | The order is cancelled and the refund exists. |
| 404 | `{ error: { code: "not-found", message } }` | The order does not exist. |
| 409 | `{ error: { code: "conflict", message } }` | The order is not `paid`, or it is older than 24 hours. |
| 502 | `{ error: { code: "payment", message } }` | Stripe does not answer. |

Example (200):

```json
{ "id": "o1", "status": "cancelled" }
```

Example (409):

```json
{ "error": { "code": "conflict", "message": "Only a paid order of the last 24 hours can be cancelled." } }
```

## Dependencies

- reads `shop-db`: the order, its status and its payment id.
- calls `stripe`: creates a refund for the payment.
- writes `shop-db`: the order with the status `cancelled`.
- publishes `order-events`: the event `order.cancelled` with the items.
