## Open the page
- Call: `api/get-user`: load the user from the route `id`.
- Then: show the form with the name and the email.
- Fail: show "User not found." when the API returns 404.

## Click "Save"
- Call: `api/update-user`: send the changed fields.
- Then: open `/users/<id>`.
- Fail: show the API error message on the form.

## Click "Cancel"
- Then: open `/users/<id>`.
