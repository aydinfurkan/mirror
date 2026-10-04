## Input

Topic `order.events`, events `order.paid` and `order.cancelled`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `eventId` | string | yes | not empty |
| `items[].productId` | string | yes | not empty |
| `items[].quantity` | integer | yes | 1 or more |

Example:

```json
{ "eventId": "evt_1", "type": "order.paid", "orderId": "o1", "items": [{ "productId": "p1", "quantity": 2 }] }
```

## Output

| Result | When |
| --- | --- |
| Lower the stock of each item | The event is a new `order.paid`. |
| Raise the stock of each item | The event is a new `order.cancelled`. |
| Do nothing | The event is of another type, or its id is already recorded. |

## Dependencies

- consumes `order-events`: the events `order.paid` and `order.cancelled`.
- writes `shop-db`: the stock and `stock_events`.
