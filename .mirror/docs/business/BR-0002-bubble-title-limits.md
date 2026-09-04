---
id: BR-0002
type: business
title: Bubble title limits
status: active
relates_to: [BR-0001]
implemented_by: [domain/bubble.rules#validateTitle]
---
## Rule

Reject a bubble title that contains no visible characters. Reject a bubble title that is
longer than 120 characters.

## Rationale

An empty title tells a reader nothing. A very long title breaks the list view.

## Acceptance criteria

- Reject an empty title.
- Reject a title that contains only whitespace.
- Accept a title of exactly 120 characters.
- Reject a title of 121 characters.
- Store nothing when the title is invalid.
