---
name: build
description: Build .mirror/visualize.html, or a review page in .mirror/features/, from the files in .mirror/xsrc/. Use when the user asks to build, rebuild or redraw the Mirror viewer.
---

# Mirror build

Each path in this skill is relative to the base directory of this skill. Read only the files
that you need.

The input is `.mirror/xsrc/**`. The template `visualize.html` is in this skill. Each build opens
the page for the user.

| Task                                                    | Files                            |
| ------------------------------------------------------- | -------------------------------- |
| Build `.mirror/visualize.html`                          | `build-data.md`, `write-page.md` |
| Build a review page `.mirror/features/NNNN-<slug>.html` | `review-page.md`                 |
