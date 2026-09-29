## 1. Read the order and its items from the database
- Return HTTP 404 when it does not exist.
- Code: `src/orders/orders.repo.ts#findOrderById`

## 2. Return the order
- Code: `src/orders/orders.route.ts#getOrder`
