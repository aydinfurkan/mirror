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

| Path | Holds |
| --- | --- |
| `.claude-plugin/marketplace.json` | The marketplace. It points to `plugin/`. |
| `plugin/` | The plugin: `skills/`, `templates/`, `references/`, `.claude-plugin/plugin.json`. Only this folder is installed. |
| `examples/bubbles/` | A demo API (`code/`) and its mirror (`.mirror/`). Open `examples/bubbles/.mirror/visualize.html` to see the viewer. |
| `docs/` | Design specs and plans. |

Check the viewer or a built page:

```sh
node plugin/templates/visualize.check.mjs [page.html]
```

Try a skill on the example: open Claude Code in `examples/bubbles/` and run
`mirror:add-feature`.
