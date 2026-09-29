## 1. Validate the body
- Return HTTP 400 when it is not valid.
- Code: `src/orders/orders.schema.ts#parseCreateOrder`

## 2. Read the products of the cart and their prices
- Return HTTP 409 when a product does not exist, is not active, or has less stock than the quantity.
- Code: `src/orders/orders.service.ts#priceCart`

## 3. Save the order with the status `pending`
- Code: `src/orders/orders.repo.ts#insertOrder`

## 4. Create a Stripe Checkout session for the order
- Put the order id in the session metadata.
- Code: `src/payments/stripe.client.ts#createCheckoutSession`

## 5. Return the order id and the session id
- Code: `src/orders/orders.route.ts#createOrder`
