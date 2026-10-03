# Review

1. Build the review page of the change with the `mirror:build` skill.
2. List the added, changed and removed flows and steps.
3. Stop and wait for the answer.
   - The user asks for changes: edit the files under `.mirror/xsrc/`. Build the same review
     page again. Ask again.
   - The user cancels: undo only your edits. Put back the old text of each file that you
     changed or deleted. Delete each file and folder that you created. Delete the review
     page. Stop.
   - The user gives an explicit OK: go to `4-code.md`.
