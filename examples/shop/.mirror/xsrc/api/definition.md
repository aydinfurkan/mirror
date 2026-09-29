The `api` project is the HTTP API of the shop. It serves the products, creates the orders, and takes the payment events from Stripe.

## Stack

- TypeScript on Node 20. Fastify 4. zod. `pg` for Postgres, `ioredis` for Redis, `kafkajs` for Kafka, the Stripe SDK.
- This example has no code. The paths in `Code:` show where the code would be.

## Technical decisions

- Keep the products and the orders in Postgres (`shop-db`).
- Cache the product list in Redis (`product-cache`) for 60 seconds.
- Create a Stripe Checkout session for each order. Mark the order paid only from the Stripe webhook, not from the browser.
- Publish `order.paid` to the Kafka topic `order.events` after an order is paid.
- Map errors to HTTP: `validation` 400, `not-found` 404, `conflict` 409, an unexpected error 500.
