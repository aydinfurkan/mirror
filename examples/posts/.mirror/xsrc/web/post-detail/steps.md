## 1. Read `id` from the route
- Code: `src/pages/PostDetailPage.tsx#PostDetailPage`

## 2. Load the post
- Show an alert when it does not exist.
- Code: `src/api/posts.api.ts#getPost`

## 3. Show the title, the author, the update time and the body
- Code: `src/pages/PostDetailPage.tsx#PostDetailPage`

## 4. When the user clicks "Delete", ask for a confirmation
- Delete the post.
- Go to the list.
- Code: `src/api/posts.api.ts#deletePost`
