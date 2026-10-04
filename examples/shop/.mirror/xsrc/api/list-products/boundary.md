## Input

`GET /products`. No parameters.

## Output

| Status | Body | When |
| --- | --- | --- |
| 200 | `Product[]` | Always. The list can be empty. |
| 500 | `{ error: { code: "unexpected", message } }` | The database fails. |

Example (200):

```json
[{ "id": "p1", "name": "Blue mug", "priceCents": 1200, "stock": 8 }]
```

Example (500):

```json
{ "error": { "code": "unexpected", "message": "Try again later." } }
```

## Dependencies

- reads `product-cache`: the cached list, 60 seconds.
- reads `shop-db`: the active products, when the cache is empty.
