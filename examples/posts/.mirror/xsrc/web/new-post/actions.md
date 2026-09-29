## Open the page
- Then: show an empty form with a title, a body and an author id.
- Code: `src/pages/NewPostPage.tsx#NewPostPage`

## Click "Create"
- Call: `api/create-post`: `POST /api/posts` with the form values.
- Then: open the detail page of the new post.
- Fail: show the error message of the API on the form.
- Code: `src/components/PostForm.tsx#PostForm`
