## Input

`POST /webhooks/stripe`, header `Stripe-Signature`, JSON body: a Stripe event.

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `type` | string | yes | Stripe event type |
| `data.object.metadata.orderId` | string | yes | for `checkout.session.completed` |

## Output

| Status | Body | When |
| --- | --- | --- |
| 200 | `{ received: true }` | The event is handled or skipped. |
| 400 | `{ error: { code: "signature", message } }` | The signature is not valid. |
| Publish `order.paid` | `{ eventId, orderId, email, items }` | The order changes to `paid`. |

## Dependencies

- writes `shop-db`: the order status `paid`.
- publishes `order-events`: the event `order.paid`.
