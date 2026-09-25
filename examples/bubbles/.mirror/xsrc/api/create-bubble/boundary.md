## Input

- `POST /bubbles` with the JSON body `{ "title": string, "ownerId": non-empty string }`.

## Output

- HTTP 201 with `{ id, title, ownerId, state: "open", createdAt, completedAt: null }`.
- HTTP 400 with `{ error: { code: "validation", field, message } }`.
- HTTP 500 with `{ error: { code: "unexpected", field: "server", message } }`.

## Dependencies

- `BubbleRepository.save` (in memory).
- `now()` and `newId()` from `src/infra/system.deps.ts`.
