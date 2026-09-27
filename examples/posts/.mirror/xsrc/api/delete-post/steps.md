## 1. Receive the request
- Read `id` from the path.
- Code: `src/api/routes/posts.route.ts#handleDeletePost`

## 2. Remove the post
- Return HTTP 404 when it does not exist.
- Code: `src/domain/post.service.ts#deletePost`

## 3. Return HTTP 204 with no body
- Code: `src/api/http.ts#sendNoContent`
