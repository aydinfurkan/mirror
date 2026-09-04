---
id: BR-0004
type: business
title: Owner bubble list
status: active
relates_to: [BR-0001]
implemented_by: [xsrc/domain/bubble.service#listBubblesByOwner, xsrc/domain/bubble.rules#sortNewestFirst]
---
## Rule

List the bubbles of one owner. Show the newest bubble first. Exclude the bubbles of every
other owner.

## Rationale

A user works on their own bubbles. Recent work matters most.

## Acceptance criteria

- Return only the bubbles whose `ownerId` matches the request.
- Order the bubbles by `createdAt`, newest first.
- Return an empty list for an owner who has no bubbles.
