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
- `.mirror/features/`: the review page of each past change.

## Rules

1. Before any change to the code, use the `mirror:change` skill and follow it.
2. Before you write or change a file under `.mirror/xsrc/`, use the `mirror:formats` skill.
3. To build the viewer or a review page, use the `mirror:build` skill.
