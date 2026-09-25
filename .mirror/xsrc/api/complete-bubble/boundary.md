## Input

- `POST /bubbles/:id/complete`. No body.

## Output

- HTTP 200 with the bubble, `state: "done"` and `completedAt` set.
- HTTP 404 with `{ error: { code: "not-found", field: "id", message } }`.
- HTTP 409 with `{ error: { code: "conflict", field: "state", message } }`.
- HTTP 500 with `{ error: { code: "unexpected", field: "server", message } }`.

## Dependencies

- `BubbleRepository.findById` and `BubbleRepository.save` (in memory).
- `now()` from `src/infra/system.deps.ts`.
