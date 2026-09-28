## 1. Receive the request
- Read the optional `authorId` from the query.
- Code: `src/api/routes/posts.route.ts#handleListPosts`

## 2. Load the posts
- Keep only the posts of the author when `authorId` is set.
- Code: `src/domain/post.service.ts#listPosts`

## 3. Sort the posts newest first
- Code: `src/domain/post.rules.ts#sortNewestFirst`

## 4. Return HTTP 200 with the list
- Code: `src/api/http.ts#sendJson`
