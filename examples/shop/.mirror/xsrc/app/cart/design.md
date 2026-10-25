## Layout

- Status bar: the time and the battery.
- App bar: the title "Cart".
- List: one row per item.
- Summary: the total and the "Pay" button, above the tab bar.
- Tab bar: "Shop" and "Cart", at the bottom.

## Components

- `CartRow`: the product image, the name, a `QuantityStepper` and the line price.
- `Button`: primary for "Pay", the full width of the screen.
- `TabBar`: two tabs. The open tab uses the primary color.

## States

- Empty: the text "Your cart is empty." and a "Shop" button.
- Paying: the "Pay" button shows a spinner and is disabled.

## Responsive

- None.
