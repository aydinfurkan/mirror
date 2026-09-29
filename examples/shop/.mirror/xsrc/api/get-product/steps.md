## 1. Read the product from the database
- Return HTTP 404 when it does not exist or is not active.
- Code: `src/products/products.repo.ts#findActiveById`

## 2. Return the product
- Code: `src/products/products.route.ts#getProduct`
