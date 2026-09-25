The `api` project is an HTTP API for posts. An author creates, reads, updates and deletes posts.

## Stack

- TypeScript on Node 20 or later. Express 4. zod. vitest and supertest for the tests.
- Start it with `npm -C code run dev`. It reads the port from `PORT`. The default port is 3000.

## Technical decisions

- Keep the posts in memory behind the `PostRepository` port in `src/domain/post.port.ts`. The service restarts empty. A real store can replace `src/infra/post.repo.memory.ts` later.
- Parse the shape of each request body with zod at the route (`src/api/routes/posts.schema.ts`). Keep the business rules in `src/domain/post.rules.ts`.
- Return a `ServiceResult` from each service function. `src/api/http.ts` maps the error codes to HTTP: `validation` 400, `not-found` 404, an unexpected error 500.
