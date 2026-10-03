# Find the entry points

For each project, find where each flow or page starts:

| Kind                            | One flow per                   | `trigger`            | `entry`             |
| ------------------------------- | ------------------------------ | -------------------- | ------------------- |
| `backend`                       | HTTP endpoint (method + path)  | `http`               | `POST /users`       |
| `worker`                        | process start or scheduled job | `main` or `schedule` | script name or cron |
| `consumer`                      | message handler                | `message`            | queue or topic name |
| `frontend`, `mobile`, `desktop` | page or screen route           | `page`               | route path          |

## Where to look

- `backend`:
  - The route files and the router setup: `app.get(...)`, `@Get()`, `@app.route`, the
    `routes/` or `api/` folders.
  - The file-based routes of a framework: `app/api/**/route.ts`, `pages/api/**`, server
    actions.
  - GraphQL: one flow per query or mutation. Use `entry: mutation createUser`.
  - RPC: one flow per service method. Use `entry: UserService.CreateUser`.
  - Webhooks: one flow per webhook endpoint, as for any HTTP endpoint.
- `worker`:
  - The `main` function or the start script in the manifest. Use `trigger: main`.
  - The scheduled jobs: cron files, a scheduler library, a CI schedule. Use
    `trigger: schedule` and the cron line as `entry`.
  - A CLI tool: one flow per command.
- `consumer`:
  - Each subscribe or handler call for a queue or a topic. Use the queue or topic name as
    `entry`.
- `frontend`, `mobile`, `desktop`:
  - The router setup or the file-based routes: `app/**/page.tsx`, `pages/**`, `src/routes/**`.
  - The navigation setup of a mobile app: the stack and tab navigators, `app/` of Expo Router.
  - The windows and the screens of a desktop app.
  - Use the route path as `entry`. Write route parameters as `:id`.

## What to skip

- Test, mock and example routes.
- Redirect-only pages and layout files without their own content.
- Tell the user about each item that you skip.

## Names

- A flow: kebab-case, verb first. Examples: `create-user`, `send-message`,
  `list-owner-orders`.
- A page: kebab-case, after its route. Examples: `home`, `profile`, `order-detail`.
- Each name is unique in its project.
- A `group`: use the route prefix or the folder name. Examples: `users`, `orders`, `auth`. Put
  health checks, metrics and readiness endpoints in the group `health`.

## Show the list

- Show one table per project with these columns: name, `trigger`, `entry`, `group`, and the
  source file.
- Wait for an OK.
- The user can rename, merge or drop items. Apply each change.
