---
name: build
description: Build .mirror/visualize.html, or a review page in .mirror/features/, from the files in .mirror/xsrc/ and open it. Use when the user asks to build, rebuild or redraw the Mirror viewer, and when the mirror:change skill asks for a page.
model: sonnet
context: fork
background: false
---

# Mirror build

Each path in this skill is relative to the base directory of this skill. Read only the files
that you need.

This skill runs in its own context on a fast model. It does not see the conversation. The task
is in the arguments. If the arguments are empty, build `.mirror/visualize.html`.

The task: $ARGUMENTS

- Input: the files in `.mirror/xsrc/`.
- Template: `visualize.html` of this skill.
- End your response with the link to the page. The caller gives it to the user.

| Task                                                    | Steps                                                       |
| ------------------------------------------------------- | ----------------------------------------------------------- |
| Build `.mirror/visualize.html`                          | Make the data with `build-data.md`. Write it with `write-page.md`. |
| Build a review page `.mirror/features/NNNN-<slug>.html` | Follow `review-page.md`.                                    |
