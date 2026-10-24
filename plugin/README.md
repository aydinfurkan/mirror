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
- **Map.** Claude reads the mirror before the code. Ask "what happens when an order is
  cancelled?" and Claude follows the flows and their links to answer.
- **Review.** For each change, Claude updates the mirror and shows you a review page. The
  code changes only after your OK. Comment on a step or a rule in the page, click "Copy
  comments", and paste them to Claude.
- **Tests.** Turns each rule of a flow or page into a test, and lists the rules without a
  test.

### Skills

- `mirror:init`: create the mirror for a repository.
- `mirror:change`: the change workflow. Claude uses it before each code change.
- `mirror:ask`: answer a question about the system from the mirror first, then from the code
  it points to.
- `mirror:sync`: find drift between the code and the mirror since the last mirror update.
  Propose mirror edits, and flag code that breaks a business rule.
- `mirror:build`: build the viewer page or a review page.
- `mirror:github`: add a GitHub workflow, so that each pull request gets a link to its review
  page. `mirror:init` offers it.
- `mirror:test`: match each rule to a test, write the missing tests, and report the rules
  without a test.
- `mirror:formats`: the `.mirror/` layout, and the rule and the example for each mirror document.

The rules live in the plugin. Your repo gets only the `.mirror/` data, so a plugin update
reaches each repo at once.

### What it runs, reads and sends

- **Hook.** At session start, in a repo with a `.mirror/` folder, a shell command loads the
  Mirror instructions into Claude.
- **Files.** Reads your code. Writes only to the `.mirror/` folder, except for the tests
  that `mirror:test` writes and the workflow that `mirror:github` writes.
- **Network.** No network calls. The HTML pages use the system fonts. Review comments stay in
  your browser until you copy them.

## Requirements

- Claude Code v2.1.218 or later. `mirror:build` runs in its own context on Sonnet and waits
  for the page, so it costs less and keeps the main conversation short. The other skills use
  the model that you chose.

## License

MIT. See `LICENSE`.
