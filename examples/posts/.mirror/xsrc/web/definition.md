The `web` project is a web app for posts. A user lists, reads, creates, edits and deletes posts through the `api` project.

## Stack

- TypeScript, React 18, React Router 6, Vite. vitest, jsdom and Testing Library for the tests.
- Start it with `npm -C web run dev`. Start the `api` project on port 3000 first.

## Technical decisions

- Call the API only through `src/api/posts.api.ts`. Each call uses the base path `/api`. The Vite dev server sends `/api/*` to `http://localhost:3000`, so the browser needs no CORS.
- Throw an `ApiError` with the status, the field and the message of the API error. A form shows that message.
- Use one form component, `src/components/PostForm.tsx`, for the new-post page and the edit-post page.
- Keep the state of each page in the page. The app has no global store.
