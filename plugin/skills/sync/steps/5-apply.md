# Apply

1. If the user selects Skip for each item, stop.
2. Before you change or delete a file under `.mirror/xsrc/`, keep its old text. You need it
   to undo your edits on a cancel.
3. Write each edit that the user selects. Change only files under `.mirror/xsrc/`.
   - Apply: write the edit from step 3.
   - Change the rule: edit `business-rules.md`. Keep the header. Update the acceptance
     criteria.
   - Fix the code: do not change the mirror.
4. Build the review page of the sync with the `mirror:build` skill. Use the slug
   `sync-<base>`, with the short hash of the base commit.
5. Stop and wait for the answer.
   - The user asks for changes: edit the files. Build the same review page again. Ask again.
   - The user cancels: put back the old text of each file. Delete each file and folder that
     you created. Delete the review page. Stop.
   - The user gives an explicit OK: build `.mirror/visualize.html` with the `mirror:build`
     skill.
6. Report the changed documents. List each "Fix the code" item. Tell the user to fix each one
   with the `mirror:change` skill. Tell the user to commit the `.mirror/` changes: the next
   sync starts from that commit.
