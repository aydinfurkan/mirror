**Design file:** none

## Layout

- Header: the title "Edit user" and a back link to `/users/<id>`.
- Form: the name and the email fields, one above the other.
- Footer: the "Cancel" and "Save" buttons, aligned to the right.

## Components

- `UserForm`: a card with the two fields and a label above each field.
- `TextField`: a label, an input and an error line below the input in the danger color.
- `Button`: primary for "Save", secondary for "Cancel".

## States

- Loading: a skeleton of the form.
- Saving: the "Save" button shows a spinner and is disabled.
- Field error: the input border and the error line use the danger color.
- Not found: the text "User not found." and a link to `/users`.

## Responsive

- On a small screen, the buttons take the full width, "Save" above "Cancel".
