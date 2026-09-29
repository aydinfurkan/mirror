## 1. Skip each event that is not `order.paid`
- Code: `src/handlers/update-stock.ts#handle`

## 2. Take the quantity of each item out of the stock, in one transaction
- Skip the event when its id is already in `stock_events`.
- Record the event id in `stock_events`.
- Code: `src/stock/stock.repo.ts#applyOrder`
