## Input

Example:

```json
{ "eventId": "evt_1", "type": "order.paid", "orderId": "o1", "email": "ada@example.com" }
```

## 1. Skip each event that is not `order.paid`

## 2. Skip the event when its receipt is already sent

## 3. Send the receipt email with SendGrid

## 4. Record that the receipt is sent

## Output

- None.
