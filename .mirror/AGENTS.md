# Mirror — Agent Instructions

## Prompt rules

1. Write all prompts in ASD-STE100 Simplified Technical English.
2. Write one imperative instruction per sentence, in the active voice.

## What to read

| Document                                     | Read                                        |
| -------------------------------------------- | ------------------------------------------- |
| [.mirror/STRUCTURE.md](STRUCTURE.md)         | Before you touch `.mirror/docs/` or the source root |
| [.mirror/config.json](config.json)           | To find the source root and the project commands |

## The one rule that matters

Write the prompt before you write the code. Every file under the source root has a mirror
prompt in `.mirror/docs/xsrc/`. Run `pnpm -C .mirror/visualize check:drift` before you report
that you are done.

## Adding a feature

Write the business rule first, then the technical decision, then the xsrc prompts, then the
tests, then the code. Follow the order in `.mirror/STRUCTURE.md`.
