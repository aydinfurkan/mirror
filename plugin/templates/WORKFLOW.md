# Mirror — Change workflow

Use this workflow for every change to the code.

Do not change code before the user approves the review.

## 1. Understand

1. Read `.mirror/config.json` and the `definition.md` of each project.
2. Ask the user about the parts of the change that are not clear. Ask one question at a time.
3. List the flows or pages that the change adds, changes or removes.

## 2. Change the mirror

1. Run `git status --porcelain .mirror/xsrc`. If it prints anything, stop. Ask the user to
   commit or stash those changes first. If the repository does not use git, skip this
   check, and undo your own mirror edits by hand on a cancel.
2. Change only files under `.mirror/xsrc/`. Do not change code in this step.
   - A new flow or page: create its folder with the four files.
   - A changed flow or page: edit its files.
   - A removed flow or page: delete its folder.
3. Follow the rule in `.mirror/rules/` for each file that you write.
4. If no file under `.mirror/xsrc/` changes, tell the user that the change does not touch the
   mirror. Ask for an OK to change the code without a review page.

## 3. Review

1. Find the next free number `NNNN` in `.mirror/features/`. Start at `0001`. Make a
   kebab-case `<slug>` from the change name.
2. Build `.mirror/features/NNNN-<slug>.html` with "Review page" in `.mirror/BUILD.md`.
3. Open the page in the default browser. Use `start "" <file>` on Windows, `open <file>`
   on macOS, and `xdg-open <file>` on Linux. If the command fails, tell the user to open
   the page. List the added, changed and removed flows and steps.
4. Stop and wait for the answer.
   - The user asks for changes: edit the files under `.mirror/xsrc/`. Build the same review
     page again. Ask again.
   - The user cancels: run `git checkout -- .mirror/xsrc` and `git clean -fd .mirror/xsrc`.
     Delete the review page. Stop.
   - The user gives an explicit OK: go to step 4.

## 4. Code

1. For each added or changed flow, write tests for its acceptance criteria. Run them. Make
   sure that the new tests fail.
2. Write the code for the steps. Put each function at the path and name in its step.
3. Remove the code and the tests of each removed flow.
4. Run the full test suite of each changed project. Make sure that all tests pass.
5. For each changed `steps.md`, make sure that each `path#function` exists in the code. Fix
   the document or the code when they do not agree.
6. Build `.mirror/visualize.html` with "Build the data" and "Write the page" in
   `.mirror/BUILD.md`.
7. Report the changed documents, the changed code files, and the test result.
