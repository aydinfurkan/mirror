**Design file:** none

## Layout

- Header: the shop name and a cart link with the item count.
- Grid: one card per product.

## Components

- `ProductCard`: the product image, the name, and the price. A "Sold out" label on the image
  when the stock is 0.

## States

- Loading: a grid of empty card skeletons.
- Empty: the text "No products yet." in the center.
- Error: an alert with "The shop is not available. Try again later."

## Responsive

- Four cards per row on a wide screen, two on a tablet, one on a phone.
