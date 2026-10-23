---
name: export
description: Export the mirror to other formats. Write an OpenAPI file for each backend project from boundary.md, and Mermaid diagrams of the links and of each flow or page from boundary.md, steps.md and actions.md. Use when the user asks to export the mirror, or asks for OpenAPI, Swagger or Mermaid.
---

# Mirror export

Each path in this skill is relative to the base directory of this skill. Read only the files
that you need.

- Input: the files in `.mirror/xsrc/`. Do not read the code.
- Output: the files in `.mirror/exports/`. Write only these files.
- An export is generated. Put a header line in each file that tells the reader to change the
  mirror and export again, not to edit the file.

| Task                                           | Steps                                  |
| ---------------------------------------------- | -------------------------------------- |
| OpenAPI: `.mirror/exports/<project>.openapi.yaml` | Follow `openapi.md`.                |
| Mermaid: `.mirror/exports/mermaid.md`          | Follow `mermaid.md`.                   |

The user can name a format (`openapi` or `mermaid`) and a project. When the user does not name
a format, do both. When the user does not name a project, export each project.

## Report

1. Give the user a link to each file that you wrote.
2. List each flow that you skipped, and why. Example: a GraphQL flow has no OpenAPI path.
3. List each value that the mirror does not give and that you left out. Do not guess a value.
