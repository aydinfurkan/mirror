## Open the page
- Call: `api/get-user`: load the user from the route `id`.
- Then: show the form with the name and the email.
- Fail: show "User not found." when the API returns 404.
- Code: `src/pages/EditUserPage.tsx#EditUserPage`

## Click "Save"
- Call: `api/update-user`: send the changed fields.
- Then: open `/users/<id>`.
- Fail: show the API error message on the form.
- Code: `src/components/UserForm.tsx#onSubmit`

## Click "Cancel"
- Then: open `/users/<id>`.
- Code: `src/components/UserForm.tsx#onCancel`
