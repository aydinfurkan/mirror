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

## Dependencies

- reads `shop-db`: the order and its items.
