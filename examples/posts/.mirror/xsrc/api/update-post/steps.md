## 1. Receive the request
- Read `id` from the path.
- Code: `src/api/routes/posts.route.ts#handleUpdatePost`

## 2. Parse the body shape
- Return HTTP 400 when it has no field to change.
- Code: `src/api/routes/posts.schema.ts#parseUpdatePostBody`

## 3. Find the post
- Return HTTP 404 when it does not exist.
- Code: `src/domain/post.service.ts#updatePost`

## 4. Validate the title when it is set
- Return HTTP 400 when it is not valid.
- Code: `src/domain/post.rules.ts#validateTitle`

## 5. Validate the body when it is set
- Return HTTP 400 when it is not valid.
- Code: `src/domain/post.rules.ts#validateBody`

## 6. Apply the given fields and record the update time
- Save the post.
- Code: `src/domain/post.service.ts#updatePost`

## 7. Return HTTP 200 with the post
- Code: `src/api/http.ts#sendJson`
