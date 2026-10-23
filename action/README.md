# Mirror review page

A GitHub Action for repositories with a `.mirror/` folder. When a pull request adds or changes
a review page in `.mirror/features/`, the action posts one comment with a link to it. The link
opens the page in the browser, the same page that Claude shows in the session. A reviewer reads
the intent first, then the code.

The action keeps one comment per pull request and updates it on each push.

## Where the page goes

GitHub shows an `.html` file in a pull request only as source code, so the action puts the page
where a browser can open it:

| Your repository                                   | The link opens                                                    |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| Has GitHub Pages on the `gh-pages` branch         | The page on your Pages site, at `pr-<number>/`. Free for public repositories. |
| No Pages: a private repository on the Free plan, or Pages is off | The page as a file of the Actions run. Free, and only people with access to the repository can open it. |

`publish: auto`, the default, picks the first that works. A Pages copy is removed when the pull
request closes. A file of the Actions run is kept as long as the artifact
retention of the repository, 90 days by default.

## Use

Add `.github/workflows/mirror.yml` to your repository:

```yaml
name: Mirror

on:
  pull_request:
    types: [opened, synchronize, reopened, closed]
    paths:
      - .mirror/**

permissions:
  contents: write       # push the gh-pages branch; contents: read is enough with no Pages
  pages: read           # find the Pages site
  pull-requests: write  # post the comment

concurrency:
  group: mirror-review-page-${{ github.event.pull_request.number }}

jobs:
  review-page:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aydinfurkan/mirror/action@main
```

To use GitHub Pages: run the workflow once, so that the `gh-pages` branch exists. Then, in
**Settings → Pages**, set **Source** to **Deploy from a branch**, the branch `gh-pages`, the
folder `/ (root)`.

## Inputs

| Input          | Default                             | What it does                                                        |
| -------------- | ----------------------------------- | ------------------------------------------------------------------- |
| `publish`      | `auto`                              | `pages`, `artifact`, or `auto`: Pages when a Pages site serves `pages-branch`, else the Actions run. |
| `mirror-dir`   | `.mirror`                           | The path of the `.mirror/` folder.                                  |
| `pages-branch` | `gh-pages`                          | The branch that GitHub Pages serves.                                |
| `pages-url`    | from the Pages settings             | The address of the Pages site, for a custom setup.                  |
| `github-token` | `${{ github.token }}`               | The token that posts the comment and pushes the Pages branch.       |
| `base`         | the base commit of the pull request | The old revision.                                                   |
| `head`         | `HEAD`                              | The new revision.                                                   |

## Outputs

- `url`: the address of the first review page, or empty when the pull request has none.

## What it runs, reads and sends

- **Runs.** `git`, one Node script, `review-page.mjs`, with no dependencies, and
  `actions/upload-artifact` for a file of the Actions run.
- **Reads.** The list of changed files in `.mirror/features/` between the two revisions.
- **Sends.** The comment to the GitHub API of your repository, and the page to your `gh-pages`
  branch or to the Actions run. On a public repository, a page on GitHub Pages is public.

A pull request from a fork gets a read-only token. Then the action cannot push or comment. It
logs a warning, and does not fail.

## Test

```sh
node --test action/review-page.test.mjs
```
