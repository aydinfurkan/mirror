# Mirror

**Your code, mirrored. Intent first, code second.**

![Mirror: ask for a change, review the mirror, then the code follows](docs/demo.gif)

A Claude Code plugin. Mirror keeps the intent of each flow and page next to the code, and
shows it in one HTML page.

## Install

```sh
/plugin marketplace add aydinfurkan/mirror
/plugin install mirror@mirror
```

## How it works

Run `mirror:init`. That's all.

From then on, Claude changes the mirror first, you review it, then the code follows.

## More

- [plugin/README.md](plugin/README.md): what the plugin does, and what it runs, reads and sends.
- [action/](action/): a GitHub Action that links the review page of each pull request in a
  comment, so that reviewers can open it in the browser.
- [examples/shop/](examples/shop/): a demo shop (web, api, worker) described by its mirror. Open
  `examples/shop/.mirror/visualize.html` to see the viewer.
