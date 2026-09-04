---
id: xsrc/app
type: xsrc
mirrors: code/src/app.ts
implements: [BR-0001]
decisions: []
functions:
  - name: run
    input: "Accept no argument."
    output: "Return the greeting for the world."
    responsibility: "Call greet with a fixed name."
    calls: [xsrc/greet#greet]
---
## Notes
