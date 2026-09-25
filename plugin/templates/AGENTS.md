# Mirror — Agent Instructions

Mirror keeps the intent of each flow and page next to the code. The mirror comes first:
change the mirror, get a review, then change the code.

## Layout

- `.mirror/config.json`: the projects, their root folders, and their kinds.
- `.mirror/xsrc/<project>/definition.md`: what the project is for, its stack, its technical decisions.
- `.mirror/xsrc/<project>/<flow-or-page>/`: `definition.md`, `steps.md`, `boundary.md`, `rules.md`.
- `.mirror/visualize.html`: the current graph. `.mirror/visualize.md`: its colors and sizes.
- `.mirror/BUILD.md`: how to build the graph and a review page.
- `.mirror/features/`: the review page of each past change.

## Rules

1. Write all prompts in ASD-STE100 Simplified Technical English.
2. Write one imperative instruction per sentence, in the active voice.
3. Use the change workflow below for every change to the code. Do not change code before the
   user approves the review.
4. Keep each code reference in `steps.md` true. The form is `path#function`. The path is
   relative to the project root in `.mirror/config.json`.

## File formats

`definition.md` of a flow or page:

```markdown
---
trigger: http            # http | main | message | schedule | page
entry: POST /users       # endpoint, script, cron, queue or topic, or route path
---
Create a user account.
```

`steps.md`: a numbered list. End each step with the code reference in backticks.

```markdown
1. Validate the request body. `src/users/users.schema.ts#parseCreateUser`
2. Save the user. `src/users/users.service.ts#createUser`
```

`boundary.md`: the contract of the flow, in three sections.

- `## Input`: the trigger line (endpoint, queue, script or route), then one table row per
  input field: path, query, body or message field. Put the shape limits (type, required,
  length, format) in the Validation column.
- `## Output`: one table row per result: each status code, event or effect, with each error.
- `## Dependencies`: a bullet list of databases, queues, external APIs, and other flows.

```markdown
## Input

`POST /users`, JSON body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `email` | string | yes | valid email, at most 254 characters |

## Output

| Status | Body | When |
| --- | --- | --- |
| 201 | `User` | The user is created. |
| 400 | `{ error: { code: "validation", field, message } }` | A field fails its validation. |

## Dependencies

- `UserRepository.save`
```

For a page, the Input table lists the route params, the query and the form fields. The
Output table lists what the page shows and where it goes. The Dependencies list the API
flows that the page calls.

`rules.md`: a bullet list of business rules, then `## Acceptance criteria`. Put the shape
limits in `boundary.md`, not here. Put here the rules that need state or context: for
example "only the author can delete a post".

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
3. Name the function of each new step, also when the function does not exist yet.
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
