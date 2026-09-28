## 1. Receive the request
- Code: `src/api/routes/posts.route.ts#handleCreatePost`

## 2. Parse the body shape
- Return HTTP 400 when it is wrong.
- Code: `src/api/routes/posts.schema.ts#parseCreatePostBody`

## 3. Validate the title
- Return HTTP 400 when it is not valid.
- Code: `src/domain/post.rules.ts#validateTitle`

## 4. Validate the body
- Return HTTP 400 when it is not valid.
- Code: `src/domain/post.rules.ts#validateBody`

## 5. Make the post with a new id and the creation time
- Save it.
- Code: `src/domain/post.service.ts#createPost`

## 6. Return HTTP 201 with the post
- Code: `src/api/http.ts#sendJson`
