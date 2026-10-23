# Mirror review page

A GitHub Action for repositories with a `.mirror/` folder. When a pull request adds or changes
a review page in `.mirror/features/`, the action posts one comment with a link to it. The link
opens the page in the browser, the same page that Claude shows in the session. A reviewer reads
the intent first, then the code.

GitHub shows an `.html` file in a pull request only as source code. So the action attaches the
page to the Actions run, unzipped, and the browser opens it. This is free on each plan, also for
a private repository, and only people with access to the repository can open the page. The page
is kept as long as the artifact retention of the repository, 90 days by default.

The action keeps one comment per pull request and updates it on each push. When a pull request
has more than one review page, the link goes to the newest one.

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
  review-page:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aydinfurkan/mirror/action@main
```

## Inputs

| Input          | Default                             | What it does                                  |
| -------------- | ----------------------------------- | --------------------------------------------- |
| `mirror-dir`   | `.mirror`                           | The path of the `.mirror/` folder.            |
| `github-token` | `${{ github.token }}`               | The token that posts the comment.             |
| `base`         | the base commit of the pull request | The old revision.                             |
| `head`         | `HEAD`                              | The new revision.                             |

## Outputs

- `url`: the address of the review page, or empty when the pull request has none.

## What it runs, reads and sends

- **Runs.** `git`, one Node script, `review-page.mjs`, with no dependencies, and
  `actions/upload-artifact`.
- **Reads.** The changed files in `.mirror/features/` between the two revisions.
- **Sends.** The page to the Actions run, and the comment to the GitHub API of your repository.

A pull request from a fork gets a read-only token. Then the action cannot comment. It logs a
warning, and does not fail.

## Test

```sh
node --test action/review-page.test.mjs
```
