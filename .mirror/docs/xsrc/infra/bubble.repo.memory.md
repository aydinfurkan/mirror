---
id: xsrc/infra/bubble.repo.memory
type: xsrc
mirrors: code/src/infra/bubble.repo.memory.ts
implements: [BR-0001, BR-0004]
decisions: [ADR-0002]
functions:
  - name: createMemoryBubbleRepository
    input: "Accept no argument."
    output: "Return a bubble repository that holds its bubbles in process memory."
    responsibility: "Give each repository its own store. Save a bubble. Find a bubble by id. Find the bubbles of one owner."
    calls: []
---
## Notes

Keep the store private to the returned object. Do not share a store between two repositories.
