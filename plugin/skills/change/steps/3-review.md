# Review

1. Build the review page of the change with the `mirror:build` skill.
2. List the added, changed and removed flows and steps. Tell the user that they can click 💬
   on a step or a rule in the page to comment on it, then click "Copy comments" and paste the
   comments here.
3. Stop and wait for the answer.
   - The user asks for changes: edit the files under `.mirror/xsrc/`. Build the same review
     page again. Ask again.
   - The user pastes comments: see "Comments". Build the same review page again. Ask again.
   - The user cancels: undo only your edits. Put back the old text of each file that you
     changed or deleted. Delete each file and folder that you created. Delete the review
     page. Stop.
   - The user gives an explicit OK: go to `4-code.md`.

## Comments

The pasted text starts with `# Mirror review comments`. Each comment is a `## N. <where>`
header, the quoted line of the page (`> …`), then the comment of the user.

- `<where>` is `<project>/<flow>, step N`, `<project>/<flow>, action "<name>"`, or
  `<project>/<flow>, <tab>, <section>`. The tab is `definition`, `rules`, `boundary` or
  `design`. A quote that starts with `old:` or `new:` is a line of a diff.
- Find the quoted line in the files of that flow or page under `.mirror/xsrc/`. Each comment
  is a change request on that line. A comment that is a question: answer it, and change
  nothing for it.
- Handle all comments in one round. Ask the user only about a comment that is not clear.
- Then list each comment by its number, with what you changed or your answer.
