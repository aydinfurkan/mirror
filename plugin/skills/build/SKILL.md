---
name: build
description: Build .mirror/visualize.html, or a review page in .mirror/features/, from the files in .mirror/xsrc/ and open it. Use when the user asks to build, rebuild or redraw the Mirror viewer, and when the mirror:change skill asks for a page.
---

# Mirror build

Each path in this skill is relative to the base directory of this skill. Read only the files
that you need.

- Input: the files in `.mirror/xsrc/`.
- Template: `visualize.html` of this skill.
- Each build opens the page for the user.

| Task                                                    | Steps                                                       |
| ------------------------------------------------------- | ----------------------------------------------------------- |
| Build `.mirror/visualize.html`                          | Make the data with `build-data.md`. Write it with `write-page.md`. |
| Build a review page `.mirror/features/NNNN-<slug>.html` | Follow `review-page.md`.                                    |
