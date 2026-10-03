# Review

1. Find the next free number `NNNN` in `.mirror/features/`. Start at `0001`. Make a
   kebab-case `<slug>` from the change name.
2. Build `.mirror/features/NNNN-<slug>.html` with `review-page.md` of `mirror:build`.
3. List the added, changed and removed flows and steps.
4. Stop and wait for the answer.
   - The user asks for changes: edit the files under `.mirror/xsrc/`. Build the same review
     page again. Ask again.
   - The user cancels: run `git checkout -- .mirror/xsrc` and `git clean -fd .mirror/xsrc`.
     Delete the review page. Stop.
   - The user gives an explicit OK: go to `4-code.md`.
