---
name: change
description: Use before any change to code in a repo with a .mirror/ folder. Change the mirror first, get a review, then change the code.
---

# Mirror — Change workflow

Do not change code before the user approves the review.

## 1. Understand

1. Read `.mirror/xsrc/config.json` and the `definition.md` of each project.
2. Ask the user about the parts of the change that are not clear. Ask one question at a time.
3. List the flows or pages that the change adds, changes or removes.
4. For each flow or page in the list, find the affected flows:
   - each flow with a link to it or to its project;
   - for each external system that it `publishes` to or `writes`, each flow that `consumes` or
     `reads` that external system.
   Show them to the user as "Affected".

## 2. Change the mirror

1. Run `git status --porcelain .mirror/xsrc`. If it prints anything, stop. Ask the user to
   commit or stash those changes first. If the repository does not use git, skip this
   check, and undo your own mirror edits by hand on a cancel.
2. Change only files under `.mirror/xsrc/`. Do not change code in this step.
   - A new flow or page: create its folder with the four files. A page has `actions.md` in
     place of `steps.md` and `design.md` in place of `boundary.md`.
   - A changed flow or page: edit its files.
   - A removed flow or page: delete its folder.
3. When the change breaks a contract of a flow (it removes a field, adds a required field, or
   changes a status code or an event shape), edit the files of each affected flow too.
4. Use the `mirror:formats` skill for each file that you write.
5. If no file under `.mirror/xsrc/` changes, tell the user that the change does not touch the
   mirror. Ask for an OK to change the code without a review page.

## 3. Review

1. Find the next free number `NNNN` in `.mirror/features/`. Start at `0001`. Make a
   kebab-case `<slug>` from the change name.
2. Build `.mirror/features/NNNN-<slug>.html` with "Review page" in the `mirror:build` skill.
3. Open the page in VS Code with `code -r <file>`. If `code` is not found, tell the user to
   open the page. List the added, changed and removed flows and steps.
4. Stop and wait for the answer.
   - The user asks for changes: edit the files under `.mirror/xsrc/`. Build the same review
     page again. Ask again.
   - The user cancels: run `git checkout -- .mirror/xsrc` and `git clean -fd .mirror/xsrc`.
     Delete the review page. Stop.
   - The user gives an explicit OK: go to step 4.

## 4. Code

1. For each added or changed flow, write tests for its acceptance criteria. Run them. Make
   sure that the new tests fail.
2. Write the code for the steps and the actions.
3. Remove the code and the tests of each removed flow.
4. Run the full test suite of each changed project and of each project with an affected flow.
   Make sure that all tests pass.
5. Build `.mirror/visualize.html` with "Build the data" and "Write the page" in the
   `mirror:build` skill.
6. Report the changed documents, the changed code files, and the test result.
