## 1. Receive the request
- Read `id` from the path.
- Code: `src/api/routes/posts.route.ts#handleGetPost`

## 2. Find the post
- Return HTTP 404 when it does not exist.
- Code: `src/domain/post.service.ts#getPost`

## 3. Return HTTP 200 with the post
- Code: `src/api/http.ts#sendJson`
