---
name: init
description: Create the Mirror folder for a repository, or add one project to it. Find each project, find where each flow or page starts, write the flow documents, and draw them in .mirror/visualize.html. Use when the user asks to init, set up, or bootstrap Mirror, or to add a project to the mirror.
---

# Mirror init

Each path in this skill is relative to the base directory of this skill.

Do the steps in order. Read each step file only when you reach that step.

## Scope

- The user can name one or more project ids: `mirror:init api`. Then do steps 3 to 5 only
  for these projects. Use this scope for a large monorepo: one project per run.
- When the user names no project, the scope is all the projects. In step 2, the user can
  select fewer projects.
- A project in `config.json` without a folder under `.mirror/xsrc/` is not mirrored yet. The
  viewer shows it with the command that adds it.

1. Check the state: `steps/1-check-state.md`
2. Find the projects: `steps/2-find-projects.md`
3. Find the entry points: `steps/3-find-entry-points.md`
4. Write the documents: `steps/4-write-documents.md`
5. Draw: `steps/5-draw.md`
6. Report: `steps/6-report.md`
