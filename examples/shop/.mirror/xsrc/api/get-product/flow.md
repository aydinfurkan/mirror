## Input

- None.

## 1. Read the product from the database
- Fail: return HTTP 404 when it does not exist or is not active.

## 2. Return the product

## Output

Example (200):

```json
{ "id": "p1", "name": "Blue mug", "description": "A mug for tea.", "priceCents": 1200, "stock": 8 }
```

Example (404):

```json
{ "error": { "code": "not-found", "message": "Product not found." } }
```
