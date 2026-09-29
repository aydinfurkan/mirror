## 1. Read the product list from the cache
- Return the cached list when it exists.
- Code: `src/products/products.cache.ts#getCachedList`

## 2. Read the products from the database
- Read only the products with `active` set to true, sorted by name.
- Code: `src/products/products.repo.ts#listActive`

## 3. Put the list in the cache for 60 seconds
- Code: `src/products/products.cache.ts#setCachedList`

## 4. Return the list
- Code: `src/products/products.route.ts#listProducts`
