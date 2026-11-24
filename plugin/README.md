# Mirror

**Your code, mirrored. Intent first, code second.**

Mirror keeps the intent of each flow and page next to the code, and shows it as a list in
one HTML file. Claude changes the mirror first, shows you a review page, and changes the
code only after your OK.

## Install

Mirror is in the official Claude Code plugin directory.

```sh
/plugin install mirror@anthropic-plugin-directory
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

- **No hooks.** The plugin has no hooks and nothing that runs on its own. Claude picks each
  skill from its description, in a repo with a `.mirror/` folder.
- **Commands.** The skills ask Claude to run a few shell commands, with your usual permission
  prompts: `git log`, `git diff` and `git ls-files` (`mirror:sync`) to find what changed, and
  `sed` (`mirror:build`, `mirror:github`) to copy a template out of the plugin.
  `mirror:change` and `mirror:test` also run your project's own test commands.
- **Files.** Reads your code. Writes the `.mirror/` folder. It also changes files outside it:
  `mirror:change` changes your code after your OK on the review page, `mirror:test` writes
  tests, and `mirror:github` writes `.github/workflows/mirror.yml` and
  `.github/mirror/review-page.mjs`.
- **Network on your machine.** None. The skills make no network calls, and the HTML pages
  load nothing from the network: they use Inter and JetBrains Mono when installed, else the
  system fonts. Your comments, read checks, theme, zoom and sidebar width stay in the local
  storage of your browser. Comments leave it only when you copy them.
- **GitHub, only with `mirror:github`.** On each pull request that changes `.mirror/`, the
  workflow runs in GitHub Actions with the `GITHUB_TOKEN` of the run, with `contents: read`
  and `pull-requests: write`. It attaches the newest review page to the run, and creates or
  updates one comment on the pull request through the GitHub API. It sends nothing outside
  GitHub, and uses no token from your machine.

## Requirements

- Claude Code v2.1.218 or later.

## License

MIT. See `LICENSE`.
