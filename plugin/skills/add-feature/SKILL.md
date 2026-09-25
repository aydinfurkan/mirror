---
name: add-feature
description: Add or change a feature the Mirror way. Change the flow documents in .mirror/xsrc first, show a review page of the change, and change the code only after the user approves. Use when the user asks to add a feature, change a behavior, or add a flow or page in a repository that has a .mirror folder.
---

# Mirror add-feature

`${CLAUDE_PLUGIN_ROOT}` is the plugin root. When it is not set, use the folder two levels
above the base directory of this skill.

Write all documents in ASD-STE100 Simplified Technical English. Write one imperative
instruction per sentence.

If `.mirror/config.json` does not exist, stop. Tell the user to run `mirror:init` first.

If the repository is not a git repository, stop. Tell the user that add-feature needs git.

## 1. Understand the feature

1. Read `.mirror/AGENTS.md`, `.mirror/config.json`, and the `definition.md` of each project.
2. Ask the user about the parts of the feature that are not clear. Ask one question at a time.
3. List the projects and the flows or pages that the feature adds, changes or removes.

## 2. Change the mirror

Run `git status --porcelain .mirror/xsrc`. If it prints anything, stop and ask the user to
commit or stash the changes first.

Change only files under `.mirror/xsrc/`. Do not change code in this step.

- A new flow or page: create the folder with `definition.md`, `steps.md`, `boundary.md`,
  `rules.md`. Use the formats in `.mirror/AGENTS.md` and the existing flows.
- A changed flow or page: edit its files.
- A removed flow or page: delete its folder.

Each new step names the function that will do the work, also when the function does not
exist yet.

## 3. Build the review page

1. Find the next free number `NNNN` in `.mirror/features/`. Start at `0001`.
2. Make a kebab-case `<slug>` from the feature name.
3. Follow "Feature review data" in `${CLAUDE_PLUGIN_ROOT}/references/build-visualize.md`.
   Write `.mirror/features/NNNN-<slug>.html`.

## 4. Review gate

Tell the user to open `.mirror/features/NNNN-<slug>.html`. List the added, changed and
removed flows and steps. Stop and wait for the answer.

- The user asks for changes: edit the files under `.mirror/xsrc/`. Build the same review page
  again. Ask again.
- The user cancels: run `git checkout -- .mirror/xsrc` and `git clean -fd .mirror/xsrc`.
  Delete the review page. Stop.
- The user gives an explicit OK: go to step 5. Do not go to step 5 without it.

## 5. Execute

1. For each added or changed flow, write tests for its `rules.md` acceptance criteria. Run
   them. Make sure that the new tests fail.
2. Write the code for the steps. Put each function at the path and name in its step.
3. Remove the code of each removed flow and its tests.
4. Run the full test suite of each changed project. Make sure that all tests pass.
5. For each changed `steps.md`, make sure that each `path#function` exists in the code. Fix
   the document or the code when they do not agree.
6. Build `.mirror/visualize.html` with "Build the data" and "Write the page" in
   `${CLAUDE_PLUGIN_ROOT}/references/build-visualize.md`. All `status` values are `null`.

## 6. Report

List the changed documents, the changed code files, and the test result.
