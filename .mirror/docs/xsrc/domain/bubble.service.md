---
id: xsrc/domain/bubble.service
type: xsrc
mirrors: code/src/domain/bubble.service.ts
implements: [BR-0001, BR-0003, BR-0004]
decisions: [ADR-0002]
functions:
  - name: createBubble
    input: "Accept the service dependencies and an input that holds a title and an owner id."
    output: "Return an ok result with the new bubble. Return a failed result with a validation error."
    responsibility: "Validate the title. Build an open bubble. Store the bubble."
    calls: [xsrc/domain/bubble.rules#validateTitle]
  - name: completeBubble
    input: "Accept the service dependencies and a bubble id."
    output: "Return an ok result with the completed bubble. Return a failed result with a not-found error or a conflict error."
    responsibility: "Find the bubble. Refuse a bubble that is already done. Set the state to done. Store the bubble."
    calls: [xsrc/domain/bubble.rules#isCompletable]
  - name: listBubblesByOwner
    input: "Accept the service dependencies and an owner id."
    output: "Return an ok result with the bubbles of the owner, newest first."
    responsibility: "Read the bubbles of the owner. Order them, newest first."
    calls: [xsrc/domain/bubble.rules#sortNewestFirst]
---
## Notes

Take the dependencies as the first argument. Do not build a closure. The graph builder reads
exported functions, so every use case must stay an exported function.
