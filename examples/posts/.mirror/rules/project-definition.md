# Rule: project `definition.md`

Path: `.mirror/xsrc/<project>/definition.md`.

## Sections

- The first paragraph: what the project is for. The viewer shows it on the project card.
- `## Stack`: the language, the framework, the main libraries, and how to start it.
- `## Technical decisions`: the choices that apply to many flows: storage, validation,
  error mapping, auth.

## Example

```markdown
The `api` project is an HTTP API for users.

## Stack

- TypeScript on Node 20. Express 4. zod.
- Start it with `npm run dev`.

## Technical decisions

- Parse the shape of each request body with zod at the route.
```
