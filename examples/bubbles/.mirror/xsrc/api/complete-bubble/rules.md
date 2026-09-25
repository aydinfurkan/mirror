- Set the state of a bubble to `done` when a user completes it.
- Record the completion time.
- Refuse to complete a bubble that is already done. A second completion loses the first completion time.

## Acceptance criteria

- Change the state from `open` to `done`.
- Set `completedAt` to the completion time.
- Report a not-found error for an unknown bubble id.
- Report a conflict error for a bubble that is already done.
