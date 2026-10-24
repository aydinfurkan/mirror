---
name: github
description: Add the Mirror GitHub workflow to a repository, so that each pull request gets a comment with a link to its review page. Use when the user asks to add Mirror to GitHub, to pull requests or to CI, and when the mirror:init skill offers it.
---

# Mirror on GitHub

Each path in this skill is relative to the base directory of this skill.

The workflow runs the Mirror review page action on each pull request that changes `.mirror/`.
It attaches the newest review page of `.mirror/features/` to the Actions run and posts one
comment with a link to it. The link opens the page in the browser. It is free on each plan, also
for a private repository, and needs no setup on GitHub.

1. Find the `.mirror/` folder. If there is none, stop. Tell the user to run `mirror:init` first.
2. Find the target: `.github/workflows/mirror.yml` at the root of the git repository.
   - If the file exists, stop. Ask the user to select one option: Overwrite or Keep.
3. Copy `workflow.yml` of this skill to the target.
   - If `.mirror/` is not at the root of the git repository, add `mirror-dir` to the last step,
     with the repository-relative path of `.mirror/`, and change the `paths` filter to the same
     path. Example: for `app/.mirror`, add `with:` and `mirror-dir: app/.mirror`, and use the
     filter `app/.mirror/**`.
4. Tell the user:
   - The path of the new file. They commit and push it.
   - From now on, each pull request with a new or changed review page gets a comment with a
     link to it. Commit the review page of a change with its code.
   - A reviewer can write comments on the page, copy them, and paste them in the pull request.
