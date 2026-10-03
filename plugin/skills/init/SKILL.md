---
name: init
description: Create the Mirror folder for a repository. Find each project, find where each flow or page starts, write the flow documents, and draw them in .mirror/visualize.html. Use when the user asks to init, set up, or bootstrap Mirror.
---

# Mirror init

## 0. Check the state

If `.mirror/xsrc/` exists, stop. Ask the user to select one option:

- Overwrite: replace all files in `.mirror/xsrc/`.
- Keep: add only the missing flows and pages.
  - Do not change existing files.
  - Skip each existing `config.json` entry, `definition.md` and flow folder.

## 1. Find the projects

1. Read each manifest in the repository: each package, build, workspace or container file of
   any language.

   Examples are `package.json`, `app.json`, `pnpm-workspace.yaml`, `go.mod`, `pyproject.toml`,
   `*.csproj`, `Cargo.toml`, `pom.xml`, `build.gradle`, `Gemfile`, `composer.json` and
   `Dockerfile`.

2. Give each project a short kebab-case id, a `root` (repository-relative), and one `kind`:
   - `backend`: it serves HTTP, GraphQL or RPC.
   - `worker`: it runs a process from `main` or on a schedule. A CLI tool is a `worker`.
   - `consumer`: it handles messages from a queue or a topic.
   - `frontend`: a web app with pages.
   - `mobile`: a mobile app with screens: Expo, React Native, Flutter, Swift or Kotlin.
   - `desktop`: a desktop app with windows or screens: Electron or Tauri.

   Special cases:
   - A serverless function: use the kind of its trigger.
     - HTTP: `backend`.
     - A queue: `consumer`.
     - A cron: `worker`.
   - A library or a shared package: it has no entry point. Show it to the user, but do not
     make it a project.

3. Split a full-stack app into one project for each kind. Examples are Next.js, Nuxt,
   Remix and SvelteKit.
   - Give each part the id `<app>-<kind>`, the same `root`, and one kind.
   - `<app>-backend`: the API routes, the route handlers and the server actions.
   - `<app>-frontend`: the pages.

4. Find the external systems.
   - Look for databases, queues and topics, caches, file storage, and APIs outside the
     repository.
   - Read the DB and queue clients and the SDKs in the manifests, the env files,
     `docker-compose.yml` and the config files.
   - Give each one a kebab-case id. Do not use the id of a project.
   - Give each one kind: `database`, `queue`, `cache`, `storage`, `api` or `service`.

5. Show the result to the user.
   - Show the projects and the external systems as two tables.
   - Wait for an OK.
   - Apply the changes that the user asks for.

6. Write `.mirror/xsrc/config.json`.
   - Use `examples/config.json` in the base directory of this skill as the example.
   - `projects`: one entry per project, with `root` and `kind`.
   - `external`: one entry per external system, with `kind` and a readable `name`.

## 2. Find the entry points

For each project, find where each flow or page starts:

| Kind                            | One flow per                   | `trigger`            | `entry`             |
| ------------------------------- | ------------------------------ | -------------------- | ------------------- |
| `backend`                       | HTTP endpoint (method + path)  | `http`               | `POST /users`       |
| `worker`                        | process start or scheduled job | `main` or `schedule` | script name or cron |
| `consumer`                      | message handler                | `message`            | queue or topic name |
| `frontend`, `mobile`, `desktop` | page or screen route           | `page`               | route path          |

### Where to look

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

### What to skip

- Health checks, metrics and readiness endpoints.
- Test, mock and example routes.
- Redirect-only pages and layout files without their own content.
- Tell the user about each item that you skip.

### Names

- A flow: kebab-case, verb first. Examples: `create-user`, `send-message`,
  `list-owner-orders`.
- A page: kebab-case, after its route. Examples: `home`, `profile`, `order-detail`.
- Each name is unique in its project.
- A `group`: a short kebab-case name for flows or pages of the same area. Examples: `users`,
  `orders`, `auth`. Use the route prefix or the folder name.

### Show the list

- Show one table per project with these columns: name, `trigger`, `entry`, `group`, and the
  source file.
- Wait for an OK.
- The user can rename, merge or drop items. Apply each change.

## 3. Write the documents

Use the `mirror:formats` skill. Follow the rule of each document that you write.

1. Write `.mirror/xsrc/<project>/definition.md`.
2. For each flow or page, trace the code from the entry point. Then write the four files in
   `.mirror/xsrc/<project>/<flow-or-page>/`. A flow has `definition.md`, `steps.md`,
   `boundary.md` and `business-rules.md`. A page has `definition.md`, `actions.md`, `design.md`
   and `business-rules.md`.
3. For a flow, read the request schemas and validators to fill the Input table of `boundary.md`.
   Read the error mapping to fill the Output table. For a page, read the components, the styles
   and the design links to write `design.md`.
4. Write the links. For a flow, write them in `## Dependencies` of `boundary.md` with the
   "Links" rule. For a page, write one `Call:` bullet per call in `actions.md`. Find the actions
   from the load effect, the event handlers and the form submits. For each API call, find the
   backend flow with the same method and path. Link to each external system that the flow uses.
5. Read the tests to find the constraints and the acceptance criteria. Ask the user for the
   context, the goal and the non-goal when the code does not show them.

## 4. Draw

1. Load the `mirror:build` skill to get its base directory.
2. Build `.mirror/visualize.html` with "Build the data" and "Write the page" in the
   `mirror:build` skill. Use `visualize.html` from the base directory of `mirror:build` as the template.
3. Check the page with step 4 of "Write the page" in the `mirror:build` skill.

## 5. Report

1. Open `.mirror/visualize.html` in VS Code with `code -r <file>`. If `code` is not found,
   tell the user to open the file.
2. Tell the user the number of projects, flows and pages. From now on, each change goes
   through the `mirror:change` skill: mirror first, then review, then code.
