The `app` project is the shop app for phones. A customer finds products, fills a cart and pays with Stripe.

## Stack

- TypeScript, React Native, Expo Router. The Stripe React Native SDK for the payment sheet.
- This example has no code.

## Technical decisions

- Call the same API as `web`, through `src/api/client.ts`.
- Keep the cart on the phone in `AsyncStorage` under the key `cart`. The cart needs no account.
- Pay in the Stripe payment sheet. The app never sees a card number.
