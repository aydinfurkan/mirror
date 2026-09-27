# Mirror — Agent Instructions

Mirror keeps the intent of each flow and page next to the code. The mirror comes first:
change the mirror, get a review, then change the code.

## Layout

- `.mirror/config.json`: the projects, their root folders, and their kinds.
- `.mirror/xsrc/<project>/definition.md`: what the project is for, its stack, its technical decisions.
- `.mirror/xsrc/<project>/<flow-or-page>/`: `definition.md`, `steps.md`, `boundary.md`, `rules.md`.
- `.mirror/visualize.html`: the current graph. `.mirror/visualize.md`: its colors and sizes.
- `.mirror/rules/`: the format of each document.
- `.mirror/BUILD.md`: how to build the graph and a review page.
- `.mirror/features/`: the review page of each past change.

## Rules

1. Write all prompts in ASD-STE100 Simplified Technical English.
2. Write one imperative instruction per sentence, in the active voice.
3. Use the change workflow below for every change to the code. Do not change code before the
   user approves the review.
4. Keep each code reference in `steps.md` true. See `.mirror/rules/steps.md`.

## File formats

Read the rule of a document before you write or change it.

| Document | Rule |
| --- | --- |
| `xsrc/<project>/definition.md` | `.mirror/rules/project-definition.md` |
| `xsrc/<project>/<flow>/definition.md` | `.mirror/rules/flow-definition.md` |
| `xsrc/<project>/<flow>/steps.md` | `.mirror/rules/steps.md` |
| `xsrc/<project>/<flow>/boundary.md` | `.mirror/rules/boundary.md` |
| `xsrc/<project>/<flow>/rules.md` | `.mirror/rules/rules.md` |

## Change workflow

### 1. Understand

1. Read `.mirror/config.json` and the `definition.md` of each project.
2. Ask the user about the parts of the change that are not clear. Ask one question at a time.
3. List the flows or pages that the change adds, changes or removes.

### 2. Change the mirror

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

### 3. Review

1. Find the next free number `NNNN` in `.mirror/features/`. Start at `0001`. Make a
   kebab-case `<slug>` from the change name.
2. Build `.mirror/features/NNNN-<slug>.html` with "Review page" in `.mirror/BUILD.md`.
3. Tell the user to open the page. List the added, changed and removed flows and steps.
4. Stop and wait for the answer.
   - The user asks for changes: edit the files under `.mirror/xsrc/`. Build the same review
     page again. Ask again.
   - The user cancels: run `git checkout -- .mirror/xsrc` and `git clean -fd .mirror/xsrc`.
     Delete the review page. Stop.
   - The user gives an explicit OK: go to step 4.

### 4. Code

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
