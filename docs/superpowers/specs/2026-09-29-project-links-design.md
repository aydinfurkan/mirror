# Project links — design

Date: 2026-09-29

## Goal

Define the connections between projects, and between projects and external systems.

- **See it:** the viewer draws the links between projects, and shows the links of each flow or page.
- **Change safety:** when Claude changes a flow, it finds the flows that depend on it, and
  updates their mirror and runs their tests.

## Decisions

- Links exist at two levels. Flow links are written by hand. Project links are derived from
  the flow links and are never written.
- A link can point to a flow, a project, or an external system (database, queue, third-party API,
  a service in another repo).
- Flow links live in the `## Dependencies` section of each `boundary.md`, in a fixed format.
  Rejected: a central `links` list in `config.json` (drifts from the flow docs, reviewed apart);
  links found in the code (fragile, and breaks "mirror first").

## 1. Format

### `config.json`

Add an optional `external` map next to `projects`:

```json
{
  "projects": {
    "api": { "root": "code", "kind": "backend" },
    "web": { "root": "web", "kind": "frontend" }
  },
  "external": {
    "posts-db":    { "kind": "database", "name": "Postgres" },
    "post-events": { "kind": "queue",    "name": "Kafka topic post.events" }
  }
}
```

- `kind` is one of `database`, `queue`, `cache`, `storage`, `api`, `service`.
- `name` is free text shown on the card.
- An external id is kebab-case and must not equal a project id.

### `boundary.md` → `## Dependencies`

One link per bullet:

```md
- calls `api/create-post`: sends the form values.
- writes `posts-db`: saves the post.
- publishes `post-events`: after the save.
```

Grammar: `- <verb> \`<target>\`[: <note>]`

- `verb` is one of `calls`, `publishes`, `consumes`, `reads`, `writes`.
- `target` is `<project>/<flow>`, `<project>` (when the flow is not known), or an external id.
- `note` is optional free text.
- A bullet that does not start with a known verb followed by a backtick span is a plain note.
  The build skips it. Use plain bullets for in-process helpers such as `now()` or `newId()`.

### Built data

The JSON in `visualize.html` gets:

- Top level `external`: `[{ "id", "kind", "name" }]`, in `config.json` key order. `[]` when absent.
- On each flow, `links`: `[{ "verb", "to", "note" }]`, in bullet order. `note` is `""` when absent.
  `[]` when there are no links.

The data does not hold project links or incoming links. The viewer derives both.

### Check

`visualize.check.mjs` fails when:

- a `verb` is not in the list;
- a `to` does not match a flow `<project>/<flow>`, a project id, or an external id;
- an external id equals a project id.

## 2. Viewer

### System tab

- A new first tab, "System".
- One card per project and one card per external system. External cards use a new token
  `--external` (added to `visualize.md` in both themes).
- One line per connected pair, with the direction, and a label that counts the links by verb
  (for example `4 calls`, `1 publishes`).
- A project-to-project line exists when any flow of project A links to project B or to a flow of B.
  A project-to-external line exists when any flow of the project links to that external.
- Click a project card to open its tab.

### Project tabs

- Each flow card shows chips at the bottom:
  - outgoing: `→ <to>`;
  - incoming: `← <project>/<flow>`, derived by reversing all links whose target is this flow.
- Click a chip on a flow target to switch to its tab, center the card and highlight it.
  A chip on a project or external target switches to the System tab and highlights that card.
- No lines are drawn across tabs.

### Drawer

- A new "Links" section with two lists: "Uses" (outgoing, with verb and note) and "Used by"
  (incoming).

### Review page

- A link change already makes the flow `changed`, because its `boundary` text differs.
- On the System tab, compare the derived project lines of the old and new data. A line only in
  the new data has the `--added` color. A line only in the old data is drawn with the
  `--removed` color.

## 3. Workflow, init, rules

### `WORKFLOW.md`

- Step 1 (Understand): for each flow or page that the change touches, find its incoming links,
  and the flows that `consumes` or `reads` an external that the flow `publishes` to or `writes`.
  List them to the user as "Affected".
- Step 2 (Change the mirror): when the change breaks the contract (a removed field, a new required
  field, a changed status code or event shape), edit the mirror of each affected flow too.
- Step 4 (Code): run the full test suite of each affected project too.

### `init` skill

- Step 1: find the external systems from DB clients, queue clients and SDKs in the manifests,
  env files and config. Show them in a second table next to the projects. Wait for an OK. Write
  them to `external` in `config.json`.
- Step 3: write `## Dependencies` in the fixed format. Match each API call of a page to a backend
  flow by method and path.

### `BUILD.md`

- "Build the data": add `external` and `links` as defined above.
- "Review page": add the System tab line comparison.

### Rules, examples, agent file

- `rules/boundary.md`: the link grammar, the verbs, the targets, and plain bullets.
- `rules/examples/boundary-rest.md`, `rules/examples/boundary-consumer.md`: use the format.
- `AGENTS.md`: add `external` to the layout line of `config.json`.
- Apply each template change to both `plugin/templates/` and `examples/posts/.mirror/`.

### Example repo

- Update `examples/posts/.mirror/config.json` and each `boundary.md` to the format.
  The api uses an in-memory repository, so it has no external: keep its repository line as a
  plain bullet.
- Rebuild `examples/posts/.mirror/visualize.html`.

## Testing

Add to `visualize.check.mjs`:

- incoming links are derived for a flow target;
- project lines are derived and counted by verb, including links to a bare project target;
- project-to-external lines;
- an unknown verb and an unknown target fail the check;
- a review page marks added and removed System lines.

Run the check on `plugin/templates/visualize.html` and on
`examples/posts/.mirror/visualize.html`. Both must print `ok`.

## Out of scope

- Finding links in the code automatically.
- Drawing lines between flows across project tabs.
- Links between external systems.
