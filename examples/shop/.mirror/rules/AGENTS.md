# Mirror — Agent Instructions

Mirror keeps the intent of each flow and page next to the code. The mirror comes first:
change the mirror, get a review, then change the code.

## Layout

- `.mirror/xsrc/config.json`: the projects, the root folder and the kind of each project, and the
  external systems (databases, queues, APIs outside the repository).
- `.mirror/xsrc/<project>/definition.md`: what the project is for, its stack, its technical decisions.
- `.mirror/xsrc/<project>/<flow-or-page>/`: `definition.md`, `steps.md`, `boundary.md`,
  `business-rules.md`. A page has `actions.md` in place of `steps.md` and `design.md` in place of
  `boundary.md`.
- `.mirror/visualize.html`: the current viewer page. `.mirror/visualize.md`: its colors and fonts.
- `.mirror/rules/`: the format of each document, in `project-rules/`, `flow-rules/` and
  `page-rules/`. Each folder has its examples in `examples/`.
- `.mirror/rules/AGENTS.md`: this file.
- `.mirror/rules/WORKFLOW.md`: the steps of each change.
- `.mirror/rules/BUILD.md`: how to build the viewer page and a review page.
- `.mirror/features/`: the review page of each past change.

## Rules

1. Write all prompts in ASD-STE100 Simplified Technical English.
2. Write one imperative instruction per sentence, in the active voice.
3. Before any change to the code, read `.mirror/rules/WORKFLOW.md` and follow it.

## File formats

Read the rule and the example of a document before you write or change it. The rules are in
`.mirror/rules/`. A flow belongs to a `backend`, `worker` or `consumer` project.
A page belongs to a `frontend` or `expo` project.

| Document                                  | Rule                           | Example                                                        |
| ----------------------------------------- | ------------------------------ | -------------------------------------------------------------- |
| `xsrc/<project>/definition.md`            | `project-rules/definition.md`  | `project-rules/examples/definition.md`                         |
| `xsrc/<project>/<flow>/definition.md`     | `flow-rules/definition.md`     | `flow-rules/examples/definition.md`                            |
| `xsrc/<project>/<flow>/steps.md`          | `flow-rules/steps.md`          | `flow-rules/examples/steps.md`                                 |
| `xsrc/<project>/<flow>/boundary.md`       | `flow-rules/boundary.md`       | `flow-rules/examples/boundary-rest.md`, `boundary-consumer.md` |
| `xsrc/<project>/<flow>/business-rules.md` | `flow-rules/business-rules.md` | `flow-rules/examples/business-rules.md`                        |
| `xsrc/<project>/<page>/definition.md`     | `page-rules/definition.md`     | `page-rules/examples/definition.md`                            |
| `xsrc/<project>/<page>/actions.md`        | `page-rules/actions.md`        | `page-rules/examples/actions.md`                               |
| `xsrc/<project>/<page>/design.md`         | `page-rules/design.md`         | `page-rules/examples/design.md`                                |
| `xsrc/<project>/<page>/business-rules.md` | `page-rules/business-rules.md` | `page-rules/examples/business-rules.md`                        |
