## Input

`POST /orders`, JSON body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `email` | string | yes | valid email |
| `items` | array | yes | 1–50 items |
| `items[].productId` | string | yes | not empty |
| `items[].quantity` | integer | yes | 1–10 |

## Output

| Status | Body | When |
| --- | --- | --- |
| 201 | `{ orderId, sessionId }` | The order is saved and the Stripe session exists. |
| 400 | `{ error: { code: "validation", field, message } }` | A field fails its validation. |
| 409 | `{ error: { code: "conflict", field: "items", message } }` | A product is not for sale or has too little stock. |
| 502 | `{ error: { code: "payment", message } }` | Stripe does not answer. |

## Dependencies

- reads `shop-db`: the products and their prices.
- writes `shop-db`: the order with the status `pending`.
- calls `stripe`: creates a Checkout session.
