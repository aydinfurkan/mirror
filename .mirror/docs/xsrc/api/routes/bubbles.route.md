---
id: xsrc/api/routes/bubbles.route
type: xsrc
mirrors: code/src/api/routes/bubbles.route.ts
implements: [BR-0001, BR-0003, BR-0004]
decisions: [ADR-0003]
functions:
  - name: postBubble
    input: "Accept the service dependencies, an HTTP request, and an HTTP response."
    output: "Write HTTP 201 with the new bubble. Write HTTP 400 with a validation error."
    responsibility: "Parse the request body. Call createBubble. Map the result to an HTTP response."
    calls: [xsrc/api/routes/bubbles.schema#parseCreateBubbleBody, xsrc/domain/bubble.service#createBubble, xsrc/api/http#sendJson, xsrc/api/http#sendServiceError]
  - name: postBubbleComplete
    input: "Accept the service dependencies, an HTTP request, and an HTTP response."
    output: "Write HTTP 200 with the completed bubble. Write HTTP 404 or HTTP 409 with an error."
    responsibility: "Read the bubble id from the path. Call completeBubble. Map the result to an HTTP response."
    calls: [xsrc/domain/bubble.service#completeBubble, xsrc/api/http#sendJson, xsrc/api/http#sendServiceError]
  - name: getBubblesByOwner
    input: "Accept the service dependencies, an HTTP request, and an HTTP response."
    output: "Write HTTP 200 with the bubbles of the owner, newest first."
    responsibility: "Read the owner id from the path. Call listBubblesByOwner. Map the result to an HTTP response."
    calls: [xsrc/domain/bubble.service#listBubblesByOwner, xsrc/api/http#sendJson, xsrc/api/http#sendServiceError]
  - name: registerBubbleRoutes
    input: "Accept an Express router and the service dependencies."
    output: "Bind three routes onto the router. Return nothing."
    responsibility: "Bind each HTTP route to its handler. Pass the dependencies to the handler. Answer with HTTP 500 when a handler fails unexpectedly."
    calls: [xsrc/api/routes/bubbles.route#postBubble, xsrc/api/routes/bubbles.route#postBubbleComplete, xsrc/api/routes/bubbles.route#getBubblesByOwner, xsrc/api/http#sendUnexpectedError]
---
## Notes

Keep each handler an exported function. Bind the handler with a thin arrow function, so the
graph builder sees the call. Attach a catch to each handler call. A handler that rejects must
not leave the request without an answer.
