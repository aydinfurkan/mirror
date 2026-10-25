# Shop example

A small online shop, described only by its mirror. **This example has no code.** Use it to see what Mirror shows for
four projects that share five external systems.

Open `.mirror/visualize.html` in a browser. Click a flow or a page in the sidebar to open it. A page
opens on its wireframe: click a button in it to follow its action to the next page or to the
backend flow it calls.

## Projects

| Project | Kind | What it does |
| --- | --- | --- |
| `web` | frontend | The shop pages. Each page has `actions.md`, `design.md` and a `design.svg` wireframe of a web page. |
| `app` | mobile | The shop app for phones. Each page has a `design.svg` wireframe of a phone screen. |
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

## Review examples

Each file in `.mirror/features/` is the review page of one change. Open it in a browser. It shows
the change as it was before the OK.

### 0001: cancel an order

`0001-cancel-order.html`: "Let a customer cancel a paid order for 24 hours."

| Item | Status | What changes |
| --- | --- | --- |
| `api/cancel-order` | added | A new flow. It refunds with `stripe`, writes `shop-db`, and publishes `order.cancelled` to `order-events`. |
| `web/order-status` | changed | A new action "Cancel the order" calls `api/cancel-order`. |
| `worker/update-stock` | changed | It also consumes `order.cancelled` and puts the items back in the stock. |

The worker is an affected flow: it consumes `order-events`, where the new flow publishes.

### 0002: a design change

`0002-checkout-order-summary.html`: "Show the items of the cart on the checkout page, with a link
back to the cart."

| Item | Status | What changes |
| --- | --- | --- |
| `web/checkout` | changed | The wireframe gets an order summary and a "Back to cart" link. A new action "Click "Back to cart"" opens `/cart`. A new acceptance criterion. |

Open its UI part and switch between **After** and **Before** to see the old and the new
wireframe. The Actions, Design and Rules parts show the changed lines.

The mirror in `.mirror/xsrc/` and `.mirror/visualize.html` show the state after the last OK. See
the `mirror:change` skill for the steps of a change.
