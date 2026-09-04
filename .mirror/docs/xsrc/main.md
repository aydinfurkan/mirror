---
id: xsrc/main
type: xsrc
mirrors: code/src/main.ts
implements: []
decisions: [ADR-0001, ADR-0002]
functions:
  - name: main
    input: "Accept no argument. Read the port from the PORT environment variable."
    output: "Start the HTTP server. Return nothing."
    responsibility: "Build the repository. Build the dependencies. Build the server. Listen on the port."
    calls: [xsrc/infra/bubble.repo.memory#createMemoryBubbleRepository, xsrc/infra/system.deps#createSystemDeps, xsrc/api/server#createServer]
---
## Notes

Compose every dependency in this file. Keep the rest of the code free of construction.
