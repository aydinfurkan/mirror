# Mirror — Agent Instructions

Mirror keeps the intent of each flow and page next to the code. The mirror comes first:
change the mirror, get a review, then change the code.

## Layout

The `.mirror/` folder and its files are in `layout.md` of the `mirror:formats` skill.

## The mirror is your map

Read `.mirror/xsrc/` before you read code. It tells you which flows and pages exist, how they
link, and where their code starts. Open only the code that the mirror points to.

## Rules

1. Before any change to the code, use the `mirror:change` skill and follow it.
2. Before you write or change a file under `.mirror/xsrc/`, use the `mirror:formats` skill.
3. To build the viewer or a review page, use the `mirror:build` skill.
4. To find the rules without a test, or to write tests from the rules, use the `mirror:test` skill.
5. To answer a question about how the system works, use the `mirror:ask` skill. Examples:
   "what happens when an order is cancelled?", "where do we send the receipt?".
