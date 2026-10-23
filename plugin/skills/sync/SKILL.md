---
name: sync
description: Find drift between the code and the mirror. Read the git diff since the last mirror update, find the affected flows and pages, propose mirror edits, and flag code that breaks a business rule. Use when the user asks to sync, check or refresh the mirror, or when code changed outside the mirror:change skill.
---

# Mirror sync

The business rules are the intent. Do not change a `business-rules.md` file to match the code
without an explicit OK from the user. Do not change code in this skill.

Each path in this skill is relative to the base directory of this skill.

Do the steps in order. Read each step file only when you reach that step.

1. Find the diff: `steps/1-find-diff.md`
2. Find the affected flows and pages: `steps/2-find-affected.md`
3. Compare: `steps/3-compare.md`
4. Report: `steps/4-report.md`
5. Apply: `steps/5-apply.md`
