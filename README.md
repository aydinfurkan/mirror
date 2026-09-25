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

## How it works

1. Run `mirror:init` once. It finds the projects and the flows, writes the documents,
   draws the graph, and adds `.mirror/AGENTS.md` and `.mirror/BUILD.md`.
2. After that, every change follows the workflow in `.mirror/AGENTS.md`: change the
   mirror, review the change on `.mirror/features/NNNN-<slug>.html`, then change the code.

A `SessionStart` hook loads `.mirror/AGENTS.md` into each Claude Code session of a
project that has a mirror.

## This repository

| Path | Holds |
| --- | --- |
| `.claude-plugin/marketplace.json` | The marketplace. It points to `plugin/`. |
| `plugin/` | The plugin: `skills/`, `hooks/`, `templates/`, `.claude-plugin/plugin.json`. Only this folder is installed. |
| `examples/posts/` | A demo API (`code/`) and its mirror (`.mirror/`). Open `examples/posts/.mirror/visualize.html` to see the viewer. |

Check the viewer or a built page:

```sh
node plugin/templates/visualize.check.mjs [page.html]
```

Try the workflow on the example: open Claude Code in `examples/posts/` and ask for a
change, for example "add comments to posts".
