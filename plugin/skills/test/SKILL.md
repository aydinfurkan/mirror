---
name: test
description: Turn each rule in the mirror into a test, and report the rules without a test. Use when the user asks which rules have tests, asks for tests from the mirror, or asks for a test coverage report of the mirror.
---

# Mirror test

Each path in this skill is relative to the base directory of this skill.

This skill changes only test files. Do not change the code or the files under `.mirror/xsrc/`.

Do the steps in order. Read each step file only when you reach that step.

1. Collect the rules: `steps/1-collect.md`
2. Match the tests: `steps/2-match.md`
3. Write the tests: `steps/3-write.md`
4. Report: `steps/4-report.md`

## Rule ids

Each rule has an id. The id is `<project>/<flow-or-page> <kind><n>`:

- `AC<n>`: the item `n` of `## Acceptance criteria` in `business-rules.md`.
- `C<n>`: the item `n` of `## Constraints` in `business-rules.md`.
- `O<n>`: the row `n` of the `## Output` table in `boundary.md`. Only a flow has it.

Count from 1, in the order of the file. Example: `api/cancel-order AC2`.

## Tags

Each test of a rule has a tag with the rule id. Put the tag in a comment on the line before
the test:

```ts
// mirror: api/cancel-order AC2
it("refuses an order that is older than 24 hours", async () => {
```

- Use the comment syntax of the language of the test.
- One test can have more than one tag. Write one tag per line.
- Give the test a name that says the rule in words. The name lets you find the rule again when
  its number changes.

## Examples

The flow `api/cancel-order` of the shop example:

- The rules from step 1: `examples/rules.md`.
- The tests with their tags from step 3: `examples/cancel-order.test.ts`.
- The report from step 4: `examples/report.md`.

The test example uses TypeScript and Vitest. Copy its shape: the tags, the test names and the
use of the boundary examples. Do not copy its language. Write each test in the language and
the framework of the project.
