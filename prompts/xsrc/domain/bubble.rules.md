---
id: xsrc/domain/bubble.rules
type: xsrc
mirrors: code/src/domain/bubble.rules.ts
implements: [BR-0002, BR-0003, BR-0004]
decisions: [ADR-0003]
functions:
  - name: validateTitle
    input: "Accept a title string."
    output: "Return null for a valid title. Return a validation error for an invalid title."
    responsibility: "Reject a title that has no visible characters. Reject a title longer than 120 characters."
    calls: []
  - name: isCompletable
    input: "Accept a bubble."
    output: "Return true when the bubble is open. Return false when the bubble is done."
    responsibility: "Report whether a user can complete this bubble."
    calls: []
  - name: sortNewestFirst
    input: "Accept an array of bubbles."
    output: "Return a new array. Put the newest bubble first."
    responsibility: "Order bubbles by creation time, newest first. Do not change the input array."
    calls: []
---
## Notes

Keep every function in this file pure. Do not read the clock. Do not touch the repository.
