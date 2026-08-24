# BubbleCode — Agent Instructions

## What to read

| Document                         | Read                                      |
| -------------------------------- | ----------------------------------------- |
| [docs/rules.md](docs/rules.md)   | Before anything else, every single time   |
| [STRUCTURE.md](STRUCTURE.md)     | Before you touch `prompts/` or `code/`    |

## The one rule that matters

Write the prompt before you write the code. Every file in `code/src/` has a mirror
prompt in `prompts/xsrc/`. Run `npm run check:drift` before you report that you are done.

## Adding a feature

Use the `/add-feature` skill. Do not add a business rule by hand.
