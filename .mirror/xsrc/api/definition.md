The `api` project is an HTTP API for bubbles. A bubble is one unit of work. An owner creates a bubble and completes it.

## Stack

- TypeScript on Node 20 or later. Express 4. zod. vitest and supertest for the tests.
- Start it with `npm -C code run dev`. It reads the port from `PORT`. The default port is 3000.

## Technical decisions

- Keep the bubbles in memory behind the `BubbleRepository` port in `src/domain/bubble.port.ts`. The service restarts empty. A real store can replace `src/infra/bubble.repo.memory.ts` later.
- Parse the shape of each request body with zod at the route (`src/api/routes/*.schema.ts`). Keep the business rules in `src/domain/bubble.rules.ts`.
- Return a `ServiceResult` from each service function. `src/api/http.ts` maps the error codes to HTTP: `validation` 400, `not-found` 404, `conflict` 409, an unexpected error 500.
