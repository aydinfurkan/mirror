## Open the page
- Call: `api/list-products`: `GET /api/products`.
- Then: show each product with its name and its price.
- Fail: show "The shop is not available. Try again later."
- Code: `src/pages/ProductsPage.tsx#ProductsPage`

## Click a product
- Then: open `/products/<id>`.
- Code: `src/components/ProductCard.tsx#ProductCard`
