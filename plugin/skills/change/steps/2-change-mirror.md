# Change the mirror

1. Run `git status --porcelain .mirror/xsrc`. If it prints anything, stop. Ask the user to
   commit or stash those changes first. If the repository does not use git, skip this
   check, and undo your own mirror edits by hand on a cancel.
2. Change only files under `.mirror/xsrc/`. Do not change code in this step.
   - A new flow or page: create its folder with its files. See "Flows and pages" in
     `layout.md` of `mirror:formats`.
   - A changed flow or page: edit its files.
   - A removed flow or page: delete its folder.
3. When the change breaks a contract of a flow (it removes a field, adds a required field, or
   changes a status code or an event shape), edit the files of each affected flow too.
4. Use the `mirror:formats` skill for each file that you write.
5. If no file under `.mirror/xsrc/` changes, tell the user that the change does not touch the
   mirror. Ask for an OK to change the code without a review page.
