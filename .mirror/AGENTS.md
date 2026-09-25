# Mirror — Agent Instructions

Mirror keeps the intent of each flow and page next to the code.

## Layout

- `.mirror/config.json`: the projects, their root folders, and their kinds.
- `.mirror/xsrc/<project>/definition.md`: what the project is for, its stack, its technical decisions.
- `.mirror/xsrc/<project>/<flow-or-page>/`: `definition.md`, `steps.md`, `boundary.md`, `rules.md`.
- `.mirror/visualize.html`: the current graph. `.mirror/visualize.md`: its colors and sizes.
- `.mirror/features/`: the review page of each past feature.

## Rules

1. Write all prompts in ASD-STE100 Simplified Technical English.
2. Write one imperative instruction per sentence, in the active voice.
3. Change the flow folder before you change the code. Use the `mirror:add-feature` skill for a new feature or a change in behavior.
4. Keep each code reference in `steps.md` true. The form is `path#function`. The path is relative to the project root in `.mirror/config.json`.
5. Rebuild `.mirror/visualize.html` after each change to `.mirror/xsrc/`.
