# Skill structure design

## Goal

- Easy to find things: each topic lives in one known file.
- No duplicate rules: each fact is written once; skills point to it.
- Smaller SKILL.md files: SKILL.md is an index; details load only when needed.
- Same shape for all skills.

## Shape

- Every skill: `SKILL.md` (short index), one file per topic, `examples/` for samples.
- Workflow skills (`init`, `change`) put topic files in `steps/`, numbered in order.
- Library skills (`formats`, `build`) put topic files beside `SKILL.md`.
- A file refers to another skill's file as "`<file>` of `mirror:<skill>`". The agent loads that
  skill to get its base directory.

## Tree

```
plugin/skills/
  formats/   SKILL.md, layout.md, flow/, page/, project/, examples/ (config.json, flow/, page/, project/)
  build/     SKILL.md, build-data.md, write-page.md, review-page.md, visualize.html
  init/      SKILL.md, steps/1-check-state.md … steps/6-report.md
  change/    SKILL.md, steps/1-understand.md … steps/4-code.md
```

## Moves

- "Links" rule: stays in `formats/flow/boundary.md`. Page `Call:` targets point to it.
- "Affected flows": stays in `change` (`steps/1-understand.md`).
- `.mirror/` layout, the files of a flow and a page, `config.json`: AGENTS.md, `change`, `init`,
  `formats` → `formats/layout.md`.
- Open a page in VS Code: `init`, `change` → the last step of `build/write-page.md`. Each build opens its page.
- `init/examples/config.json` → `formats/examples/config.json`.

## Outside the skills

- `plugin/AGENTS.md`: intro + rules; points to `layout.md` of `mirror:formats`.
- `plugin.json`: version `0.5.0`.

## Check

1. Each path and skill name in the skills exists.
2. Each rule of the old skills is in one new file, except the removed duplicates.
3. Each SKILL.md is an index.
4. Dry run of `mirror:init` on a copy of `examples/shop`.

## Out of scope

Changing what a rule says.
