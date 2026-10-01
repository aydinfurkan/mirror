# Shop example

A small online shop, described only by its mirror. **This example has no code.** The `Code:`
paths in the mirror show where the code would be. Use it to see what Mirror shows for
three projects that share five external systems.

Open `.mirror/visualize.html` in a browser. Each project has a tab. Click a flow to open it.

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

## A review example

`.mirror/features/0001-cancel-order.html` is the review page of one change: "Let a customer
cancel a paid order for 24 hours." Open it in a browser. It shows the change as it was before
the OK:

| Item | Status | What changes |
| --- | --- | --- |
| `api/cancel-order` | added | A new flow. It refunds with `stripe`, writes `shop-db`, and publishes `order.cancelled` to `order-events`. |
| `web/order-status` | changed | A new action "Cancel the order" calls `api/cancel-order`. |
| `worker/update-stock` | changed | It also consumes `order.cancelled` and puts the items back in the stock. |

The worker is an affected flow: it consumes `order-events`, where the new flow publishes. The
mirror in `.mirror/xsrc/` and `.mirror/visualize.html` show the state after the OK. See
`.mirror/WORKFLOW.md` for the steps of a change.
