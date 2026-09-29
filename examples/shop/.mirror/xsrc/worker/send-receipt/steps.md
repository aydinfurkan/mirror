## 1. Skip each event that is not `order.paid`
- Code: `src/handlers/send-receipt.ts#handle`

## 2. Skip the event when its receipt is already sent
- Code: `src/receipts/receipts.repo.ts#wasSent`

## 3. Send the receipt email with SendGrid
- Code: `src/receipts/mailer.ts#sendReceipt`

## 4. Record that the receipt is sent
- Code: `src/receipts/receipts.repo.ts#markSent`
