**Relates to:** `web/posts-list`
**Inherits:** none
**Supersedes:** none

## Context

The web app shows all posts, or the posts of one author.

## Goal

- List all posts when the request names no author.
- List only the posts of the author when the request names one.

## Non-goal

- Split the list into pages.
- Search the text of the posts.

## Constraints

- Show the newest post first.

## Acceptance criteria

- Order the posts by `createdAt`, newest first.
- Return only the posts whose `authorId` matches the query.
- Return an empty list for an author who has no posts.

## Open Questions

- When do we need pages for a long list?
