# Check the state

If `.mirror/xsrc/` exists, stop. Ask the user to select one option:

- Overwrite: replace all files in `.mirror/xsrc/`.
- Keep: add only the missing flows and pages.
  - Do not change existing files.
  - Skip each existing `config.json` entry, `definition.md` and flow folder.
