---
id: BR-0001
type: business
title: Bubble creation
status: active
relates_to: [BR-0002]
implemented_by: [domain/bubble.service#createBubble]
---
## Rule

Create a bubble when a user supplies a title and an owner id. Set the state of the new
bubble to `open`. Record the creation time. Give the bubble a unique id.

## Rationale

A bubble is one unit of work. A user needs a bubble before the user can track the work.

## Acceptance criteria

- Return the new bubble with the state `open`.
- Set `completedAt` to null on the new bubble.
- Store the new bubble in the repository.
- Give each bubble a different id.
