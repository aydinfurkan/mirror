# Check the state

## The user named projects

1. If `.mirror/xsrc/config.json` does not exist, go to step 2. Step 2 finds all the projects
   and writes `config.json`.
2. For each named project that already has a folder `.mirror/xsrc/<project>/`, ask the user to
   select one option for that project only:
   - Overwrite: replace the files in `.mirror/xsrc/<project>/`.
   - Keep: add only the missing flows and pages of the project.
3. Do not change the files of the other projects.

## The user named no project

If `.mirror/xsrc/` exists, stop. Ask the user to select one option:

- Overwrite: replace all files in `.mirror/xsrc/`.
- Keep: add only the missing flows and pages.
  - Do not change existing files.
  - Skip each existing `config.json` entry, `definition.md` and flow folder.
