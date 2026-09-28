## 1. Read `id` from the route
- Load the post.
- Show an alert when it does not exist.
- Code: `src/api/posts.api.ts#getPost`

## 2. Show the form with the current title and body
- Code: `src/components/PostForm.tsx#PostForm`

## 3. When the user clicks "Save", send the title and the body
- Code: `src/api/posts.api.ts#updatePost`

## 4. Show the error message of the API on the form when the API rejects the change
- Code: `src/components/PostForm.tsx#PostForm`

## 5. Open the detail page of the post
- Code: `src/pages/EditPostPage.tsx#EditPostPage`
