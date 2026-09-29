## Open the page
- Call: `api/list-posts`: `GET /api/posts` with the optional `authorId` from the URL query.
- Then: show each post as a link to its detail page. Show "No posts yet." for an empty list.
- Code: `src/pages/PostsListPage.tsx#PostsListPage`

## Type an author id
- Call: `api/list-posts`: load the posts again with the new `authorId`.
- Then: put the author id into the URL query.
- Code: `src/pages/PostsListPage.tsx#PostsListPage`
