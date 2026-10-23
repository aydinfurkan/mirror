# Compare

For each flow or page from step 2, read its files under `.mirror/xsrc/`. Read the diff of its
code files: `git diff <base> -- <file>`. Read the full code where the diff is not clear.

Put each difference in one class:

| Class  | When                                                                                       | Example                                                      |
| ------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Stale  | The code changed a detail. The business rules still hold. The mirror must follow the code. | A new step, a new field in `boundary.md`, a changed action.  |
| Drift  | The code breaks a constraint or an acceptance criterion in `business-rules.md`.            | The rules say "only the author can delete". The code lets any user delete. |
| Unsure | You cannot tell if the change is on purpose.                                               | A rule and the code do not agree, and the diff has no reason. |

- A difference with no effect on the mirror files is not a difference. Examples: a refactor, a
  rename inside a function, a log line.
- For each "Stale" item, write the edit for each file: `steps.md`, `boundary.md`,
  `actions.md`, `design.md` or `definition.md`. Use the `mirror:formats` skill.
- For each "Drift" item, name the rule. Name the code file and the line. Do not write an edit.
- For each "Missing" item, write the new flow or page folder. Use the `mirror:formats` skill.
  Mark its `business-rules.md` as a proposal: the code shows what it does, not why.
- For each "Gone" item, propose to delete its folder.
- Keep the edits in memory. Do not write files in this step.
