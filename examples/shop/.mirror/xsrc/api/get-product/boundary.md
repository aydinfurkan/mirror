## Input

`GET /products/:id`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `id` | path string | yes | not empty |

## Output

| Status | Body | When |
| --- | --- | --- |
| 200 | `Product` with `description` | The product exists and is active. |
| 404 | `{ error: { code: "not-found", message } }` | The product does not exist or is not active. |

Example (200):

```json
{ "id": "p1", "name": "Blue mug", "description": "A mug for tea.", "priceCents": 1200, "stock": 8 }
```

Example (404):

```json
{ "error": { "code": "not-found", "message": "Product not found." } }
```

## Dependencies

- reads `shop-db`: the product by id.
