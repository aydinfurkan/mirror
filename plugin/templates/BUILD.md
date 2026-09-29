# Build visualize.html

`.mirror/WORKFLOW.md` and the Mirror `init` skill use this procedure. The script
`.mirror/build.mjs` does all the work. It needs Node 20 or later. Do not build the page by hand.

## Build the graph

Run `node .mirror/build.mjs .mirror`.

- It reads `.mirror/config.json`, `.mirror/visualize.md` and `.mirror/xsrc/**`.
- It fills the template `.mirror/visualize.html`. Use `--template <file>` to use another
  template, for example `templates/visualize.html` of the Mirror plugin on the first build.
- It writes `.mirror/visualize.html`.

## Build a review page

Run `node .mirror/build.mjs .mirror --review NNNN-<slug>`.

- It compares the files in `.mirror/xsrc/` with the data in the current `.mirror/visualize.html`.
- It marks each project, flow, step and external system as `added`, `changed` or `removed`.
- It writes `.mirror/features/NNNN-<slug>.html`. It does not change `.mirror/visualize.html`.

## Link errors

The script finds the links in the `## Dependencies` section of each `boundary.md` and in the
`Call:` bullets of each `actions.md`. When a link is not correct, it prints the error and
writes nothing.

1. Read each error line. It names the flow and the problem.
2. Fix the `boundary.md`, the `actions.md`, or the `external` map in `config.json`.
3. Run the script again.

## Check the page

When the Mirror plugin is installed, run
`node <plugin root>/templates/visualize.check.mjs .mirror/visualize.html`. It must print `ok`.

## The data

The script writes the data as JSON into `<script type="application/json" id="mirror-data">`.
Use it as a reference. Do not edit it.

```json
{
  "generated": "2026-09-25",
  "title": "my-repo",
  "external": [{ "id": "users-db", "kind": "database", "name": "Postgres", "status": null,
    "into": [{ "from": "api/create-user", "verb": "writes", "note": "" }] }],
  "system": { "edges": [{ "from": "api", "to": "ext:users-db", "label": "1 writes", "status": null }] },
  "projects": [{
    "id": "api", "kind": "backend", "definition": "…", "status": null,
    "flows": [{
      "id": "create-user", "kind": "flow", "trigger": "http", "entry": "POST /users", "group": "users",
      "definition": "…", "boundary": "…", "rules": "…", "status": null,
      "out": [{ "verb": "writes", "to": "users-db", "note": "", "key": "ext:users-db" }], "into": [],
      "steps": [{ "n": 1, "title": "Validate the body.", "text": "Validate the body.", "details": [], "ref": "src/users/route.ts#postUser", "status": null }]
    }]
  }]
}
```

- A page with `actions.md` also has `actions`: the full text of the file. Its `steps` are its
  actions.
- A `changed` project or flow on a review page has `old`: the old value of each field that
  changed.
