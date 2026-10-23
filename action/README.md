# Mirror intent diff

A GitHub Action for repositories with a `.mirror/` folder. On each pull request, it compares
`.mirror/xsrc/` of the base and of the pull request, and posts one comment: the added, changed
and removed projects, flows, pages, steps, actions, business rules and external systems. A
reviewer reads the intent first, then the code.

The action keeps one comment per pull request and updates it on each push. It writes the same
text to the job summary.

## Use

Add `.github/workflows/mirror.yml` to your repository:

```yaml
name: Mirror

on:
  pull_request:
    paths:
      - .mirror/**

permissions:
  contents: read
  pull-requests: write

jobs:
  intent-diff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aydinfurkan/mirror/action@main
```

## Inputs

| Input          | Default                                | What it does                                              |
| -------------- | -------------------------------------- | --------------------------------------------------------- |
| `mirror-dir`   | `.mirror`                              | The path of the `.mirror/` folder.                        |
| `github-token` | `${{ github.token }}`                  | The token that posts the comment. Needs `pull-requests: write`. |
| `base`         | the base commit of the pull request    | The old revision.                                         |
| `head`         | `HEAD`                                 | The new revision.                                         |
| `comment`      | `true`                                 | `false` writes only the job summary.                      |

## Outputs

- `changed`: `true` when the pull request changes the intent in `.mirror/xsrc/`.

## The comment

- A table of each added, changed or removed flow and page, with its entry and what changed:
  the trigger, entry, group, definition, boundary, design, business rules, steps or actions.
- For each one: its definition, the added and removed steps or actions, and a diff of each
  changed file.
- A table of each changed project definition and each added, changed or removed external
  system of `config.json`.
- A link to each review page in `.mirror/features/` that the pull request adds or changes.

The comparison follows the `mirror:build` skill: a flow matches by project and folder, a step
by its text.

## What it runs, reads and sends

- **Runs.** `git` and one Node script, `intent-diff.mjs`, with no dependencies. Node is on
  every GitHub-hosted runner.
- **Reads.** Only `.mirror/` at the two revisions. It fetches the base commit when the checkout
  does not have it.
- **Sends.** The comment, to the GitHub API of your repository.

A pull request from a fork gets a read-only token. Then the action writes only the job
summary, and does not fail.

## Run it locally

```sh
MIRROR_BASE=origin/main node action/intent-diff.mjs
```

It prints the comment. Tests: `node --test action/intent-diff.test.mjs`.
