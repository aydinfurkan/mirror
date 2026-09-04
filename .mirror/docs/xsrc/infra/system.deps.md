---
id: xsrc/infra/system.deps
type: xsrc
mirrors: code/src/infra/system.deps.ts
implements: []
decisions: [ADR-0002]
functions:
  - name: createSystemDeps
    input: "Accept a bubble repository."
    output: "Return the service dependencies that hold the repository, a real clock, and a real id generator."
    responsibility: "Supply the effects that the domain must not create for itself."
    calls: []
---
## Notes

Keep every real effect in this file. A test supplies its own clock and its own id generator.
