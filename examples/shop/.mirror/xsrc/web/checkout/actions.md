## Open the page
- Then: show the cart total and an email field.
- Code: `src/pages/CheckoutPage.tsx#CheckoutPage`

## Click "Pay"
- Call: `api/create-order`: `POST /api/orders` with the email and the cart items.
- Call: `stripe`: `redirectToCheckout` with the session id.
- Then: Stripe opens its payment page. After the payment, Stripe opens `/orders/<orderId>`.
- Fail: show the API error on the form for 400 and 409. Show "Payment is not available." for 502.
- Code: `src/pages/CheckoutPage.tsx#onPay`
