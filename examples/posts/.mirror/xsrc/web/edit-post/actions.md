## Open the page
- Call: `api/get-post`: `GET /api/posts/:id` with the route `id`.
- Then: show the form with the current title and body.
- Fail: show an alert when the post does not exist.
- Code: `src/pages/EditPostPage.tsx#EditPostPage`

## Click "Save"
- Call: `api/update-post`: `PATCH /api/posts/:id` with the title and the body.
- Then: open the detail page of the post.
- Fail: show the error message of the API on the form.
- Code: `src/components/PostForm.tsx#PostForm`
