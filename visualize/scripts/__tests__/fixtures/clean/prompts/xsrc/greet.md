---
id: xsrc/greet
type: xsrc
mirrors: code/src/greet.ts
implements: [BR-0001]
decisions: [ADR-0001]
functions:
  - name: greet
    input: "Accept a name string."
    output: "Return a greeting string."
    responsibility: "Build a greeting from the name."
    calls: []
---
## Notes
