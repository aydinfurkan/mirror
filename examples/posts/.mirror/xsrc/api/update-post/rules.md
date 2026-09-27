## Business rules

- Change only the fields that the request sets.
- Record the update time. Keep the creation time.
- Use the same title and body limits as when a post is created.

## Acceptance criteria

- Keep each field that the request does not set.
- Set `updatedAt` to the update time.
- Reject a request that sets no field.
- Keep the post unchanged when a field is invalid.
- Report a not-found error for an unknown id.
