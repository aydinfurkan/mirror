---
id: BR-0003
type: business
title: Bubble completion
status: active
relates_to: [BR-0001]
implemented_by: [xsrc/domain/bubble.service#completeBubble, xsrc/domain/bubble.rules#isCompletable]
---
## Rule

Set the state of a bubble to `done` when a user completes it. Record the completion time.
Refuse to complete a bubble that is already done.

## Rationale

A user must see which work is finished. A second completion overwrites the first
completion time. The system then loses the history.

## Acceptance criteria

- Change the state from `open` to `done`.
- Set `completedAt` to the completion time.
- Report a not-found error for an unknown bubble id.
- Report a conflict error for a bubble that is already done.
