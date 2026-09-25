## Input

- `GET /owners/:ownerId/bubbles`.

## Output

- HTTP 200 with an array of bubbles. The array can be empty.
- HTTP 500 with `{ error: { code: "unexpected", field: "server", message } }`.

## Dependencies

- `BubbleRepository.findByOwner` (in memory).
