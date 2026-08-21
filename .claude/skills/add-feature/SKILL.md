---
name: add-feature
description: Use when adding a feature, a business rule, or a use case to BubbleCode - interviews for the business rule and the technical decisions, then writes the prompts, the tests, and the code in that order.
---

# Add a feature to BubbleCode

BubbleCode is prompt-first. Write the intent, then write the code. Never the reverse.

## Before you start

1. Read `docs/rules.md`. Write every prompt in Simplified Technical English.
2. Read `STRUCTURE.md`. Follow the frontmatter schemas exactly.
3. Run `npm run check:drift`. A repository that already drifts must be clean before you add
   to it. Report the drift and stop if you cannot clean it.
4. List `prompts/business/` and `prompts/technical/` to find the next free number.

## Step 1 — Interview for the business rule

Ask one question per message. Do not batch them.

1. Who acts, and what do they want to happen?
2. What triggers the rule?
3. What is the outcome when everything is valid?
4. What must the system refuse, and what does it say when it refuses?
5. What must stay true afterwards that a test can check?

Then write `prompts/business/BR-####-<slug>.md` with the schema from `STRUCTURE.md`. Leave
`implemented_by` empty for now; you fill it in at step 4.

**Show the file to the user. Wait for approval. Do not continue without it.**

## Step 2 — Interview for the technical decisions

Read every file in `prompts/technical/`. Decide which existing decisions already cover this
feature.

Ask the user only about what the existing decisions do not settle. Typical questions:

- Does this need a new endpoint, or does it extend one?
- Where does the rule belong: the route boundary, the domain, or the repository?
- Does the repository port need a new method?
- What HTTP status does each failure return?

Write a new ADR **only when the feature makes a decision that no existing ADR covers**. A
new ADR needs a real alternative that you rejected. When no new decision exists, cite the
existing ADRs in the xsrc prompts and say so.

**Show the new ADR, or say that no new ADR is needed. Wait for approval.**

## Step 3 — Propose the implementation plan

Write a short plan in chat, not in a file:

- Every file in `code/src/` to create or to change.
- Every exported function, with its signature.
- Every new call edge, in the form `<file id>#<function> -> <file id>#<function>`.
- Every test file to create or to change.

**Wait for approval.**

## Step 4 — Write the prompts

For each affected file, create or update `prompts/xsrc/<file id>.md`:

- Add a `functions` entry for every new exported function, with `name`, `input`, `output`,
  `responsibility`, and `calls`.
- Add the business rule ids to `implements` and the decision ids to `decisions`.
- Declare a `calls` entry only for a call to an exported function in `code/src`. A method
  call on an injected object is not a call edge.

Then add the function ids to `implemented_by` in the business rule you wrote at step 1.

## Step 5 — Write the tests, then the code

Follow test-driven development.

1. Write the failing test in `code/test/`, mirroring the source path.
2. Run `npm --workspace code run test`. Confirm that it fails for the right reason.
3. Write the smallest code that passes.
4. Run the tests again. Confirm that they pass.

Write one test per acceptance criterion in the business rule.

## Step 6 — Verify

Run all of these and paste the real output:

```bash
npm run check:drift
npm --workspace code run typecheck
npm test
```

`check:drift` must report `0 drift`. If it reports drift, fix the prompt or the code. Never
change the checker to make the number smaller.

## Step 7 — Commit

```bash
git add prompts/ code/
git commit -m "feat: <the business rule title>"
```

## Rules that do not bend

- Write the prompt before the code.
- Stop at every approval gate.
- Report the real command output. Never claim that a check passed without pasting it.
- One business rule per feature. Two rules mean two runs of this skill.
