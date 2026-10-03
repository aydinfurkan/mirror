# Find the projects

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
   - Give each one an id and a kind with "config.json" in `layout.md` of `mirror:formats`.

5. Show the result to the user.
   - Show the projects and the external systems as two tables.
   - Wait for an OK.
   - Apply the changes that the user asks for.

6. Write `.mirror/xsrc/config.json` with "config.json" in `layout.md` of `mirror:formats`.
