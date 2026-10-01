**Design file:** none

## Layout

- Header: the shop name and a cart link with the item count.
- Main: the product image on the left. The name, the price, the description and the stock on
  the right.
- Buy box: the quantity field and the "Add to cart" button, below the description.

## Components

- `QuantityField`: a number field with a minus and a plus button.
- `Button`: primary for "Add to cart".
- `Toast`: "Added to cart." at the bottom of the screen for 3 seconds.

## States

- Loading: a skeleton of the image and the text.
- Not found: the text "Product not found." and a link to `/`.
- Too many: the text "Only <stock> left." below the quantity field in the danger color.
- Sold out: the "Add to cart" button is disabled.

## Responsive

- On a small screen, the image is above the text.
