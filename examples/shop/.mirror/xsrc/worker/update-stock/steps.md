## 1. Skip each event that is not `order.paid` or `order.cancelled`

## 2. Take the quantity of each item out of the stock, in one transaction
- Do it only for `order.paid`.
- Skip the event when its id is already in `stock_events`.
- Record the event id in `stock_events`.

## 3. Put the quantity of each item back in the stock, in one transaction
- Do it only for `order.cancelled`.
- Skip the event when its id is already in `stock_events`.
- Record the event id in `stock_events`.
