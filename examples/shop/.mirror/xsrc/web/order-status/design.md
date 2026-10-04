**Design file:** none

## Layout

- Header: the shop name and the title "Your order".
- Status: a large status badge and the order number.
- Items: one row per item, then the total.
- Footer: the "Cancel order" button, when the order can be cancelled.

## Components

- `StatusBadge`: green for "Paid", gray for "Waiting for the payment…", red for "Cancelled".
- `Button`: secondary for "Cancel order".
- `ConfirmDialog`: "Cancel this order?" with "Keep order" and "Cancel order".

## States

- Loading: a skeleton of the badge and the rows.
- Pending: the badge shows a spinner.
- Not found: the text "Order not found." and a link to `/`.
- Cancel error: an alert with "This order can no longer be cancelled."

## Responsive

- None.
