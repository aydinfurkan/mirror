---
name: github
description: Add the Mirror GitHub workflow to a repository, so that each pull request gets a comment with a link to its review page. Use when the user asks to add Mirror to GitHub, to pull requests or to CI, and when the mirror:init skill offers it.
---

# Mirror on GitHub

Each path in this skill is relative to the base directory of this skill.

The workflow runs the Mirror review page script on each pull request that changes `.mirror/`.
The script is a file in the repository, so the workflow runs only code that the user can read
and commits. It attaches the newest review page of `.mirror/features/` to the Actions run and posts one
comment with a link to it. The link opens the page in the browser. It is free on each plan, also
for a private repository, and needs no setup on GitHub.

1. Find the `.mirror/` folder. If there is none, stop. Tell the user to run `mirror:init` first.
2. Find the targets at the root of the git repository: `.github/workflows/mirror.yml` and
   `.github/mirror/review-page.mjs`.
   - If either file exists, stop. Ask the user to select one option: Overwrite or Keep.
3. Copy `workflow.yml` of this skill to `.github/workflows/mirror.yml`.
   - If `.mirror/` is not at the root of the git repository, set `MIRROR_DIR` to the
     repository-relative path of `.mirror/`, and change the `paths` filter to the same path.
     Example: for `app/.mirror`, use `MIRROR_DIR: app/.mirror` and the filter `app/.mirror/**`.
4. Write the script to `.github/mirror/review-page.mjs`: the `js` block of
   `review-page-script.md` of this skill. Copy it with a shell command, not by hand:
   `sed -e '1,/^```js$/d' -e '/^```$/,$d' <skill base directory>/review-page-script.md > <target path>`.
5. Tell the user:
   - The paths of the two new files. They commit and push them.
   - From now on, each pull request with a new or changed review page gets a comment with a
     link to it. Commit the review page of a change with its code.
   - A reviewer can write comments on the page, copy them, and paste them in the pull request.
