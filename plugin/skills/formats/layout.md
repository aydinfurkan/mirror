# The .mirror/ folder

- `.mirror/xsrc/config.json`: the projects and the external systems. See "config.json".
- `.mirror/xsrc/<project>/definition.md`: what the project is for, its stack, its technical
  decisions.
- `.mirror/xsrc/<project>/<flow-or-page>/`: the files of one flow or one page. See "Flows and
  pages".
- `.mirror/visualize.html`: the current viewer page. Its colors and fonts are in its
  `MIRROR:TOKENS` block.
- `.mirror/features/`: the review page of each past change.

## Flows and pages

- A flow belongs to a `backend`, `worker` or `consumer` project. It has `definition.md`,
  `steps.md`, `boundary.md` and `business-rules.md`.
- A page belongs to a `frontend`, `mobile` or `desktop` project. It has `definition.md`,
  `actions.md`, `design.md` and `business-rules.md`.

## config.json

- `projects`: one entry per project id, with `root` (repository-relative) and `kind`. The kinds
  are `backend`, `worker`, `consumer`, `frontend`, `mobile` and `desktop`.
- `external`: one entry per external system id, with `kind` and a readable `name`. An external
  system is a database, a queue or a topic, a cache, a file storage, or an API outside the
  repository. The kinds are `database`, `queue`, `cache`, `storage`, `api` and `service`.
- Each id is kebab-case. Do not give an external system the id of a project.

Example: `examples/config.json`.
