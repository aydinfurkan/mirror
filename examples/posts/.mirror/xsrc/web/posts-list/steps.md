## 1. Read the optional `authorId` from the URL query
- Code: `src/pages/PostsListPage.tsx#PostsListPage`

## 2. Load the posts
- Filter them by author when `authorId` is set.
- Code: `src/api/posts.api.ts#listPosts`

## 3. Show each post as a link to its detail page
- Show "No posts yet." for an empty list.
- Code: `src/pages/PostsListPage.tsx#PostsListPage`

## 4. Put the author id that the user types into the URL query
- Load the posts again.
- Code: `src/pages/PostsListPage.tsx#PostsListPage`
