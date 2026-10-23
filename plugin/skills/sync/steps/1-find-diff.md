# Find the diff

1. If `.mirror/xsrc/` does not exist, stop. Tell the user to run `mirror:init`.
2. Find the base commit. If the user gives a commit, a tag or a branch, use it. Else use the
   last commit that changed `.mirror/xsrc/`:
   `git log -1 --format=%H -- .mirror/xsrc/`
3. If no commit changed `.mirror/xsrc/`, stop. Tell the user that the mirror is not in git
   yet. Ask for a base commit.
4. List the changed code files since the base commit. Include the uncommitted and the
   untracked files. Skip the files under `.mirror/`.
   - `git diff --name-status <base> -- . ':(exclude).mirror'`
   - `git ls-files --others --exclude-standard -- . ':(exclude).mirror'`
5. If the list is empty, tell the user that the mirror is in sync. Stop.
6. Tell the user the base commit, its date, and the number of changed files.
