## Layout

- Header: the shop name, the title "Checkout" and a "Back to cart" link.
- Summary: one row per item of the cart, then the total.
- Form: the email field.
- Footer: the "Pay" button.

## Components

- `SummaryRow`: the product name, the quantity and the line price.
- `TextField`: a label, an input and an error line below the input in the danger color.
- `Button`: primary for "Pay".

## States

- Paying: the "Pay" button shows a spinner and is disabled.
- Field error: the API error message below the email field.
- Error: an alert with "Payment is not available."

## Responsive

- On a small screen, the "Pay" button takes the full width.
