- List all posts when the request names no author.
- List only the posts of the author when the request names one.
- Show the newest post first.

## Acceptance criteria

- Order the posts by `createdAt`, newest first.
- Return only the posts whose `authorId` matches the query.
- Return an empty list for an author who has no posts.
