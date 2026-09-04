---
id: xsrc/api/http
type: xsrc
mirrors: code/src/api/http.ts
implements: []
decisions: [ADR-0003]
functions:
  - name: sendJson
    input: "Accept a response, an HTTP status number, and a body value."
    output: "Write the status and the JSON body to the response. Return nothing."
    responsibility: "Write one JSON response."
    calls: []
  - name: sendServiceError
    input: "Accept a response and a service error."
    output: "Write the matching HTTP status and an error body to the response. Return nothing."
    responsibility: "Map a service error code to an HTTP status. Send the error as JSON."
    calls: [xsrc/api/http#sendJson]
  - name: sendUnexpectedError
    input: "Accept a response."
    output: "Write HTTP 500 with an error body to the response. Return nothing."
    responsibility: "Answer a request that failed for a reason the domain does not describe."
    calls: [xsrc/api/http#sendJson]
---
## Notes

Map `validation` to 400. Map `not-found` to 404. Map `conflict` to 409. Map every other
failure to 500.
