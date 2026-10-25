## Open the page
- Then: show each item of the cart from `AsyncStorage`, and the total.

## Change a quantity
- Then: save the new quantity. Remove the item when the quantity is 0.

## Tap "Pay"
- Call: `api/create-order`: `POST /api/orders` with the email of the account and the cart items.
- Call: `stripe`: `presentPaymentSheet` with the session id.
- Then: clear the cart and show "Thank you! Your order is paid."
- Fail: show the API error for 400 and 409. Keep the cart when the payment fails.

## Tap "Shop"
- Then: open `/`.
