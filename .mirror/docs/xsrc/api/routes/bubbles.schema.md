---
id: xsrc/api/routes/bubbles.schema
type: xsrc
mirrors: code/src/api/routes/bubbles.schema.ts
implements: [BR-0001]
decisions: [ADR-0003]
functions:
  - name: parseCreateBubbleBody
    input: "Accept an unknown request body."
    output: "Return an ok result with a typed create input. Return a failed result with a validation error."
    responsibility: "Check the shape of the body with zod. Report the first invalid field."
    calls: []
---
## Notes

Check the shape only. Keep the title-length rule in the domain.
