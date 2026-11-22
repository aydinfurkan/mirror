## Input

Topic `order.events`, event `order.paid`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `eventId` | string | yes | not empty |
| `orderId` | string | yes | not empty |
| `email` | string | yes | valid email |

## Output

| Result | When |
| --- | --- |
| Send the receipt email | The receipt of the event is not sent yet. |
| Do nothing | The event is not `order.paid`, or the receipt is already sent. |
| Retry, then send the event to `order.events.dlq` | SendGrid fails 5 times. |

## Dependencies

- consumes `order-events`: the event `order.paid`.
- reads `shop-db`: the sent receipts.
- writes `shop-db`: a sent receipt.
- calls `mailer`: sends the email.
