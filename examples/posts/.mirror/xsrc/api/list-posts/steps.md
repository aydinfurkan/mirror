1. Receive the request. Read the optional `authorId` from the query. `src/api/routes/posts.route.ts#handleListPosts`
2. Load the posts. Keep only the posts of the author when `authorId` is set. `src/domain/post.service.ts#listPosts`
3. Sort the posts newest first. `src/domain/post.rules.ts#sortNewestFirst`
4. Return HTTP 200 with the list. `src/api/http.ts#sendJson`
