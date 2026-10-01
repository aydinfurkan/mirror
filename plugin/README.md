# Mirror

**Your code, mirrored. Intent first, code second.**

Mirror keeps the intent of each flow and page next to the code, and shows it as a list in
one HTML file. Claude changes the mirror first, shows you a review page, and changes the
code only after your OK.

## Install

```sh
/plugin marketplace add aydinfurkan/mirror
/plugin install mirror@mirror
```

## How it works

Run `mirror:init`. That's all.

From then on, Claude changes the mirror first, you review it, then the code follows.

## What it does

- **Init.** Finds each flow and page in your code and writes down its intent.
- **Viewer.** Lists all flows and pages in one HTML page you can search and open.
- **Review.** For each change, Claude updates the mirror and shows you a review page. The
  code changes only after your OK.

### What it runs, reads and sends

- **Hook.** At session start, a shell command loads the mirror rules into Claude.
- **Files.** Reads your code. Writes only to the `.mirror/` folder.
- **Commands.** Runs `code` to open a page in VS Code.
- **Network.** No network calls. The HTML pages load fonts from Google Fonts.

## Requirements

- Claude Code.
- VS Code with the `code` command, optional, to open the pages.

## License

MIT. See `LICENSE`.
