# Mirror — Agent Instructions

Mirror keeps the intent of each flow and page next to the code. The mirror comes first:
change the mirror, get a review, then change the code.

## Layout

- `.mirror/config.json`: the projects, their root folders, and their kinds.
- `.mirror/xsrc/<project>/definition.md`: what the project is for, its stack, its technical decisions.
- `.mirror/xsrc/<project>/<flow-or-page>/`: `definition.md`, `steps.md`, `boundary.md`, `rules.md`.
- `.mirror/visualize.html`: the current graph. `.mirror/visualize.md`: its colors and sizes.
- `.mirror/rules/`: the format of each document.
- `.mirror/WORKFLOW.md`: the steps of each change.
- `.mirror/BUILD.md`: how to build the graph and a review page.
- `.mirror/features/`: the review page of each past change.

## Rules

1. Write all prompts in ASD-STE100 Simplified Technical English.
2. Write one imperative instruction per sentence, in the active voice.
3. Before any change to the code, read `.mirror/WORKFLOW.md` and follow it.

## File formats

Read the rule of a document before you write or change it.

| Document                              | Rule                                  |
| ------------------------------------- | ------------------------------------- |
| `xsrc/<project>/definition.md`        | `.mirror/rules/project-definition.md` |
| `xsrc/<project>/<flow>/definition.md` | `.mirror/rules/flow-definition.md`    |
| `xsrc/<project>/<flow>/steps.md`      | `.mirror/rules/steps.md`              |
| `xsrc/<project>/<flow>/boundary.md`   | `.mirror/rules/boundary.md`           |
| `xsrc/<project>/<flow>/rules.md`      | `.mirror/rules/rules.md`              |
