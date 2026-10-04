**Design file:** none

## Layout

- Header: the shop name and the title "Checkout".
- Form: the cart total and the email field.
- Footer: the "Pay" button.

## Components

- `TextField`: a label, an input and an error line below the input in the danger color.
- `Button`: primary for "Pay".

## States

- Paying: the "Pay" button shows a spinner and is disabled.
- Field error: the API error message below the email field.
- Error: an alert with "Payment is not available."

## Responsive

- On a small screen, the "Pay" button takes the full width.
