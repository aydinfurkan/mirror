## Input

- None.

## 1. Read the order and its items from the database
- Fail: return HTTP 404 when it does not exist.

## 2. Return the order

## Output

Example (200):

```json
{ "id": "o1", "status": "paid", "totalCents": 2400, "items": [{ "productId": "p1", "name": "Blue mug", "quantity": 2 }] }
```

Example (404):

```json
{ "error": { "code": "not-found", "message": "Order not found." } }
```
