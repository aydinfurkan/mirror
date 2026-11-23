# Check the state

If `.mirror/xsrc/` exists, stop. Ask the user to select one option:

- Overwrite: replace all files in `.mirror/xsrc/`.
- Keep: add only the missing flows and pages.
  - Do not change existing files.
  - Skip each existing `config.json` entry, `definition.md` and flow folder.
  - Add `ui/main/design.svg` to each existing page that has no wireframe, and
    `ui/<view>/variations.svg` to each view whose components have more than one look. See
    `page/design-svg.md` and `page/variations-svg.md` of `mirror:formats`. Do not move the
    files of an older page.
