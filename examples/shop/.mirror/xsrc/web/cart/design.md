**Design file:** none

## Layout

- Header: the shop name and the title "Cart".
- List: one row per item.
- Summary: the total and the "Checkout" button, below the list.

## Components

- `CartRow`: the product image, the name, a `QuantityField` and the line price.
- `Button`: primary for "Checkout".

## States

- Empty: the text "Your cart is empty." and a link to `/`.

## Responsive

- On a small screen, the summary sticks to the bottom of the screen.
