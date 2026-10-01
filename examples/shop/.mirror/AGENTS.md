# Mirror — Agent Instructions

Mirror keeps the intent of each flow and page next to the code. The mirror comes first:
change the mirror, get a review, then change the code.

## Layout

- `.mirror/config.json`: the projects, the root folder and the kind of each project, and the
  external systems (databases, queues, APIs outside the repository).
- `.mirror/xsrc/<project>/definition.md`: what the project is for, its stack, its technical decisions.
- `.mirror/xsrc/<project>/<flow-or-page>/`: `definition.md`, `steps.md` (a page:
  `actions.md`), `boundary.md`, `rules.md`.
- `.mirror/visualize.html`: the current viewer page. `.mirror/visualize.md`: its colors and fonts.
- `.mirror/rules/`: the format of each document.
- `.mirror/WORKFLOW.md`: the steps of each change.
- `.mirror/BUILD.md`: how to build the viewer page and a review page.
- `.mirror/features/`: the review page of each past change.

## Rules

1. Write all prompts in ASD-STE100 Simplified Technical English.
2. Write one imperative instruction per sentence, in the active voice.
3. Before any change to the code, read `.mirror/WORKFLOW.md` and follow it.

## File formats

Read the rule and the example of a document before you write or change it. The rules are in
`.mirror/rules/`. The examples are in `.mirror/rules/examples/`.

| Document                              | Rule                    | Example                                                  |
| ------------------------------------- | ----------------------- | -------------------------------------------------------- |
| `xsrc/<project>/definition.md`        | `project-definition.md` | `examples/project-definition.md`                         |
| `xsrc/<project>/<flow>/definition.md` | `flow-definition.md`    | `examples/flow-definition.md`                            |
| `xsrc/<project>/<flow>/steps.md`      | `steps.md`              | `examples/steps.md`                                      |
| `xsrc/<project>/<page>/actions.md`    | `actions.md`            | `examples/actions.md`                                    |
| `xsrc/<project>/<flow>/boundary.md`   | `boundary.md`           | `examples/boundary-rest.md`, `examples/boundary-consumer.md` |
| `xsrc/<project>/<flow>/rules.md`      | `rules.md`              | `examples/rules.md`                                      |
