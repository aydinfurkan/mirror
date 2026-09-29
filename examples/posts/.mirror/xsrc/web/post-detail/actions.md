## Open the page
- Call: `api/get-post`: `GET /api/posts/:id` with the route `id`.
- Then: show the title, the author, the update time and the body.
- Fail: show an alert when the post does not exist.
- Code: `src/pages/PostDetailPage.tsx#PostDetailPage`

## Click "Delete"
- Call: `api/delete-post`: `DELETE /api/posts/:id` after the user confirms.
- Then: go to the list.
- Code: `src/pages/PostDetailPage.tsx#PostDetailPage`
