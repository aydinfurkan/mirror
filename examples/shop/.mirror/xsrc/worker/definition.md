The `worker` project handles the order events from Kafka. It sends the receipt and updates the stock after a payment.

## Stack

- TypeScript on Node 20. `kafkajs`, `pg`, the SendGrid SDK.
- This example has no code. The paths in `Code:` show where the code would be.

## Technical decisions

- Read the topic `order.events` in the consumer group `shop-worker`. Commit the offset after the handler ends.
- Make each handler idempotent with the event id. Kafka can deliver an event more than one time.
- Send an event that fails 5 times to the topic `order.events.dlq`.
