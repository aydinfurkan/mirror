# Mirror

A Claude Code plugin. Mirror keeps the intent of each flow and page next to the code, and
draws it as a graph in one HTML file.

- `.mirror/xsrc/<project>/` holds one folder per flow (backend, worker, consumer) or page
  (frontend, Expo), with `definition.md`, `steps.md`, `boundary.md`, `rules.md`.
- `.mirror/visualize.html` draws them. `.mirror/visualize.md` sets its colors and sizes.

## Install

```sh
/plugin marketplace add aydinfurkan/mirror
/plugin install mirror@mirror
```

## Skills

- `mirror:init`: find the projects and the flows, write the documents, draw the graph.
- `mirror:add-feature`: change the flow documents, show a review page, then change the code.

## This repository

- `skills/`, `templates/`, `references/`, `.claude-plugin/`: the plugin.
- `code/`: a demo API. `.mirror/`: its mirror.
- `node templates/visualize.check.mjs [page.html]`: check the viewer or a built page.
