## Input

`GET /orders/:id`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `id` | path string | yes | not empty |

## Output

| Status | Body | When |
| --- | --- | --- |
| 200 | `Order` | The order exists. |
| 404 | `{ error: { code: "not-found", message } }` | The order does not exist. |

Example (200):

```json
{ "id": "o1", "status": "paid", "totalCents": 2400, "items": [{ "productId": "p1", "name": "Blue mug", "quantity": 2 }] }
```

Example (404):

```json
{ "error": { "code": "not-found", "message": "Order not found." } }
```

## Dependencies

- reads `shop-db`: the order and its items.
