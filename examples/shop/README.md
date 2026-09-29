# Shop example

A small online shop, described only by its mirror. **This example has no code.** The `Code:`
paths in the mirror show where the code would be. Use it to see what Mirror draws for
three projects, five external systems, and the links between them.

Open `.mirror/visualize.html` in a browser. Start on the **System** tab.

## Projects

| Project | Kind | What it does |
| --- | --- | --- |
| `web` | frontend | The shop pages. Each page has `actions.md`. |
| `api` | backend | The HTTP API. |
| `worker` | consumer | Handles the events of the Kafka topic `order.events`. |

## External systems

| Id | Kind | Name |
| --- | --- | --- |
| `shop-db` | database | Postgres |
| `product-cache` | cache | Redis |
| `order-events` | queue | Kafka topic `order.events` |
| `stripe` | api | Stripe API |
| `mailer` | api | SendGrid |

## The buy flow

1. `web/checkout` calls `api/create-order`. The API writes the order to `shop-db` and calls
   `stripe` for a Checkout session.
2. The page calls `stripe` to open the payment page.
3. Stripe calls `api/stripe-webhook`. The API marks the order paid in `shop-db` and publishes
   `order.paid` to `order-events`.
4. `worker/send-receipt` consumes the event and calls `mailer`. `worker/update-stock` consumes
   it and writes the stock to `shop-db`.
5. `web/order-status` calls `api/get-order` until the order is paid.
