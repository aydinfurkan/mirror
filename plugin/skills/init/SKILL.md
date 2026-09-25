---
name: init
description: Create the Mirror folder for a repository. Find each project, find where each flow or page starts, write the flow documents, and draw them in .mirror/visualize.html. Use when the user asks to init, set up, or bootstrap Mirror.
---

# Mirror init

`${CLAUDE_PLUGIN_ROOT}` is the plugin root. When it is not set, use the folder two levels
above the base directory of this skill.

Write all documents in ASD-STE100 Simplified Technical English. Write one imperative
instruction per sentence.

## 0. Check the state

If `.mirror/xsrc/` exists, stop. Ask the user: overwrite it, or keep it and add only the
missing flows and pages. Do what the user selects. When the user keeps it, do not change
existing files. Skip each existing `config.json` entry, `definition.md` and flow folder.

## 1. Find the projects

1. Read the manifests in the repository: `package.json`, `app.json`, `pnpm-workspace.yaml`,
   `go.mod`, `pyproject.toml`, `*.csproj`, `Cargo.toml`, `Dockerfile`.
2. Give each project a short kebab-case id, a `root` (repository-relative), and `kinds`:
   - `backend`: it serves HTTP, GraphQL or RPC.
   - `worker`: it runs a process from `main` or on a schedule.
   - `consumer`: it handles messages from a queue or a topic.
   - `frontend`: a web app with pages.
   - `expo`: an Expo or React Native app with screens.
3. Show the list to the user as a table. Wait for an OK. Apply the changes the user asks for.
4. Write `.mirror/config.json`:

```json
{ "projects": { "<id>": { "root": "<path>", "kinds": ["backend"] } } }
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

1. Write `.mirror/xsrc/<project>/definition.md`:
   - The first paragraph: what the project is for.
   - `## Stack`: language, framework, main libraries, how to start it.
   - `## Technical decisions`: the choices that apply to many flows (storage, validation,
     error mapping, auth).
2. For each flow or page, trace the code from the entry point. Then write
   `.mirror/xsrc/<project>/<flow>/`:

`definition.md`:

```markdown
---
trigger: http
entry: POST /users
---
Create a user account.
```

`steps.md`: a numbered list. Write one step per function that does a distinct part of the
work. End each step with the code reference in backticks. The path is relative to the
project root.

```markdown
1. Validate the request body. `src/users/users.schema.ts#parseCreateUser`
2. Save the user. `src/users/users.service.ts#createUser`
3. Return HTTP 201 with the user. `src/users/users.route.ts#postUser`
```

`boundary.md`: three sections. `## Input`: the request, message or route params.
`## Output`: each response or effect, with each error. `## Dependencies`: databases, queues,
external APIs, and other flows.

`rules.md`: a bullet list of business rules, then `## Acceptance criteria` with one bullet
per testable result. Read the tests to find the rules.

For a page, the steps describe data loads and user actions, and the boundary lists the API
calls of the page.

## 4. Agent rules and build guide

1. Copy `${CLAUDE_PLUGIN_ROOT}/templates/AGENTS.md` to `.mirror/AGENTS.md` if it does not exist.
2. Copy `${CLAUDE_PLUGIN_ROOT}/templates/BUILD.md` to `.mirror/BUILD.md` if it does not exist.
3. If the repository root has no `AGENTS.md`, create it with this text:
   `This repository uses Mirror. Read [.mirror/AGENTS.md](.mirror/AGENTS.md) and follow it.`

## 5. Draw

1. Copy `${CLAUDE_PLUGIN_ROOT}/templates/visualize.md` to `.mirror/visualize.md` if it does
   not exist.
2. Build `.mirror/visualize.html` with "Build the data" and "Write the page" in
   `.mirror/BUILD.md`. Use `${CLAUDE_PLUGIN_ROOT}/templates/visualize.html` as the template.
3. Run `node "${CLAUDE_PLUGIN_ROOT}/templates/visualize.check.mjs" .mirror/visualize.html`.
   It must print `ok`.

## 6. Report

Tell the user the number of projects, flows and pages. Tell the user to open
`.mirror/visualize.html` in a browser. Tell the user to commit `.mirror/`. From now on, each
change goes through the change workflow in `.mirror/AGENTS.md`: mirror first, then review,
then code.
