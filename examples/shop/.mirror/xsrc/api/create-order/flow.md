## Input

Example:

```json
{ "email": "ada@example.com", "items": [{ "productId": "p1", "quantity": 2 }] }
```

## 1. Validate the body
- Fail: return HTTP 400 when it is not valid.

## 2. Read the products of the cart and their prices
- Fail: return HTTP 409 when a product does not exist, is not active, or has less stock than the quantity.

## 3. Save the order with the status `pending`

## 4. Create a Stripe Checkout session for the order
- Put the order id in the session metadata.

## 5. Return the order id and the session id

## Output

Example (201):

```json
{ "orderId": "o1", "sessionId": "cs_test_a1b2" }
```

Example (409):

```json
{ "error": { "code": "conflict", "field": "items", "message": "Blue mug has only 1 left." } }
```
