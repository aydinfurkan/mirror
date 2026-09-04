---
id: xsrc/api/server
type: xsrc
mirrors: code/src/api/server.ts
implements: []
decisions: [ADR-0003]
functions:
  - name: createServer
    input: "Accept the service dependencies."
    output: "Return an Express application that serves the health route and the bubble routes."
    responsibility: "Build the application. Read JSON bodies. Serve a health route. Mount the bubble routes."
    calls: [xsrc/api/routes/bubbles.route#registerBubbleRoutes, xsrc/api/http#sendJson]
---
## Notes

Do not listen on a port in this file. A test builds the application without a port.
