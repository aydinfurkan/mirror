## Open the page
- Call: `api/get-product`: `GET /api/products/:id` with the route `id`.
- Then: show the name, the description, the price and the stock.
- Fail: show "Product not found." for 404.

## Click "Add to cart"
- Then: add the product to the cart in `localStorage`. Show "Added to cart."
- Fail: show "Only <stock> left." when the cart quantity is more than the stock.
