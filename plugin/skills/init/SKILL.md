---
name: init
description: Create the Mirror folder for a repository. Find each project, find where each flow or page starts, write the flow documents, and draw them in .mirror/visualize.html. Use when the user asks to init, set up, or bootstrap Mirror.
---

# Mirror init

## 0. Check the state

If `.mirror/xsrc/` exists, stop. Ask the user: overwrite it, or keep it and add only the
missing flows and pages. Do what the user selects. When the user keeps it, do not change
existing files. Skip each existing `config.json` entry, `definition.md` and flow folder.

## 1. Find the projects

1. Read the manifests in the repository: `package.json`, `app.json`, `pnpm-workspace.yaml`,
   `go.mod`, `pyproject.toml`, `*.csproj`, `Cargo.toml`, `Dockerfile`.
2. Give each project a short kebab-case id, a `root` (repository-relative), and one `kind`:
   - `backend`: it serves HTTP, GraphQL or RPC.
   - `worker`: it runs a process from `main` or on a schedule.
   - `consumer`: it handles messages from a queue or a topic.
   - `frontend`: a web app with pages.
   - `expo`: an Expo or React Native app with screens.
3. Split a full-stack app into one project for each kind. Examples are Next.js, Nuxt,
   Remix and SvelteKit. Give each part the id `<app>-<kind>`, the same `root`, and one kind.
   - `<app>-backend`: the API routes, the route handlers and the server actions.
   - `<app>-frontend`: the pages.
4. Find the external systems: databases, queues and topics, caches, file storage, and APIs
   outside the repository. Read the DB and queue clients and the SDKs in the manifests, the env
   files, `docker-compose.yml` and the config files. Give each one a kebab-case id and one kind:
   `database`, `queue`, `cache`, `storage`, `api` or `service`. Do not use the id of a project.
5. Show the projects and the external systems to the user as two tables. Wait for an OK. Apply
   the changes the user asks for.
6. Write `.mirror/xsrc/config.json`:

```json
{ "projects": {
  "web-backend": { "root": "apps/web", "kind": "backend" },
  "web-frontend": { "root": "apps/web", "kind": "frontend" }
}, "external": {
  "app-db": { "kind": "database", "name": "Postgres" }
} }
```

## 2. Find the entry points

For each project, find where each flow starts:

| Kind | One flow per | `trigger` | `entry` |
| --- | --- | --- | --- |
| `backend` | HTTP endpoint (method + path) | `http` | `POST /users` |
| `worker` | process start or scheduled job | `main` or `schedule` | script name or cron |
| `consumer` | message handler | `message` | queue or topic name |
| `frontend`, `expo` | page or screen route | `page` | route path |

Name each flow in kebab-case with a verb first: `create-user`, `send-message`,
`list-owner-orders`. Name each page after its route: `home`, `profile`, `order-detail`.

Show the list per project to the user. Wait for an OK. The user can rename, merge or drop items.

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

1. Load the `mirror:build` skill to get its base directory. Copy `visualize.md` from that
   directory to `.mirror/visualize.md` if it does not exist.
2. Build `.mirror/visualize.html` with "Build the data" and "Write the page" in the
   `mirror:build` skill. Use `visualize.html` from the base directory of `mirror:build` as the template.
3. Check the page with step 4 of "Write the page" in the `mirror:build` skill.

## 5. Report

1. Open `.mirror/visualize.html` in VS Code with `code -r <file>`. If `code` is not found,
   tell the user to open the file.
2. Tell the user the number of projects, flows and pages. From now on, each change goes
   through the `mirror:change` skill: mirror first, then review, then code.
