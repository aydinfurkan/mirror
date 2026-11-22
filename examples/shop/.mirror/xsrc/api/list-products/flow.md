## Input

- None.

## 1. Read the product list from the cache
- Return the cached list when it exists.

## 2. Read the products from the database
- Read only the products with `active` set to true, sorted by name.

## 3. Put the list in the cache for 60 seconds

## 4. Return the list

## Output

Example (200):

```json
[{ "id": "p1", "name": "Blue mug", "priceCents": 1200, "stock": 8 }]
```

Example (500):

```json
{ "error": { "code": "unexpected", "message": "Try again later." } }
```
