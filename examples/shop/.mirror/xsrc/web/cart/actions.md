## Open the page
- Then: show each item of the cart from `localStorage`, and the total.
- Code: `src/pages/CartPage.tsx#CartPage`

## Change a quantity
- Then: save the new quantity. Remove the item when the quantity is 0.
- Code: `src/cart/cart.store.ts#setQuantity`

## Click "Checkout"
- Then: open `/checkout`.
- Code: `src/pages/CartPage.tsx#CartPage`
