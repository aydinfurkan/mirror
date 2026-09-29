The `web` project is the shop for customers. A customer finds products, fills a cart, pays with Stripe and follows the order.

## Stack

- TypeScript, React 18, React Router 6, Vite. Stripe.js for the payment page.
- This example has no code. The paths in `Code:` show where the code would be.

## Technical decisions

- Call the API only through `src/api/client.ts`. Each call uses the base path `/api`.
- Keep the cart in `localStorage` under the key `cart`. The cart needs no account.
- Send the customer to Stripe Checkout to pay. The shop never sees a card number.
