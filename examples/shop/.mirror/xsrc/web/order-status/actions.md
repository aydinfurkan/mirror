## Open the page
- Call: `api/get-order`: `GET /api/orders/:id` with the route `id`.
- Then: show the status, the items and the total. Clear the cart when the status is `paid`.
- Fail: show "Order not found." for 404.
- Code: `src/pages/OrderStatusPage.tsx#OrderStatusPage`

## Wait while the order is pending
- Call: `api/get-order`: ask again every 3 seconds, at most 10 times.
- Then: show "Paid" when the status changes to `paid`.
- Fail: show "We are still waiting for the payment. Check your email." after 10 tries.
- Code: `src/pages/OrderStatusPage.tsx#useOrderPolling`

## Cancel the order
- Show the button only when the status is `paid` and the order is less than 24 hours old.
- Call: `api/cancel-order`: `POST /api/orders/:id/cancel` after the customer confirms.
- Then: show "Cancelled. The money comes back in 5–10 days."
- Fail: show "This order can no longer be cancelled." for 409.
- Code: `src/pages/OrderStatusPage.tsx#useCancelOrder`
