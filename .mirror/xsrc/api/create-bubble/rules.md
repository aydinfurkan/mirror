- Create a bubble when a user supplies a title and an owner id.
- Set the state of the new bubble to `open`. Record the creation time. Give the bubble a unique id.
- Reject a title that contains no visible characters.
- Reject a title that is longer than 120 characters.

## Acceptance criteria

- Return the new bubble with the state `open`.
- Set `completedAt` to null on the new bubble.
- Store the new bubble in the repository.
- Give each bubble a different id.
- Reject an empty title.
- Reject a title that contains only whitespace.
- Accept a title of exactly 120 characters.
- Reject a title of 121 characters.
- Store nothing when the title is invalid.
