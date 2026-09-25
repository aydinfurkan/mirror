1. Receive the request. `src/api/routes/posts.route.ts#handleCreatePost`
2. Parse the body shape. Return HTTP 400 when it is wrong. `src/api/routes/posts.schema.ts#parseCreatePostBody`
3. Validate the title. Return HTTP 400 when it is not valid. `src/domain/post.rules.ts#validateTitle`
4. Validate the body. Return HTTP 400 when it is not valid. `src/domain/post.rules.ts#validateBody`
5. Make the post with a new id and the creation time. Save it. `src/domain/post.service.ts#createPost`
6. Return HTTP 201 with the post. `src/api/http.ts#sendJson`
