# Mirror — Agent Instructions

Mirror keeps the intent of each flow and page next to the code. The mirror comes first:
change the mirror, get a review, then change the code.

## Layout

The `.mirror/` folder and its files are in `layout.md` of the `mirror:formats` skill.

## Rules

1. Before any change to the code, use the `mirror:change` skill and follow it.
2. Before you write or change a file under `.mirror/xsrc/`, use the `mirror:formats` skill.
3. To build the viewer or a review page, use the `mirror:build` skill.
