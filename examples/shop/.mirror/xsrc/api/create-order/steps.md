## 1. Validate the body
- Return HTTP 400 when it is not valid.

## 2. Read the products of the cart and their prices
- Return HTTP 409 when a product does not exist, is not active, or has less stock than the quantity.

## 3. Save the order with the status `pending`

## 4. Create a Stripe Checkout session for the order
- Put the order id in the session metadata.

## 5. Return the order id and the session id
