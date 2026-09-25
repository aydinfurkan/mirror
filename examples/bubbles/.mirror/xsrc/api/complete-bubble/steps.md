1. Receive the request. Read `id` from the path. `src/api/routes/bubbles.route.ts#postBubbleComplete`
2. Find the bubble. Return HTTP 404 when it does not exist. `src/domain/bubble.service.ts#completeBubble`
3. Make sure that the bubble is open. Return HTTP 409 when it is done. `src/domain/bubble.rules.ts#isCompletable`
4. Set the state to `done` and record the completion time. Save the bubble. `src/domain/bubble.service.ts#completeBubble`
5. Return HTTP 200 with the bubble. `src/api/http.ts#sendJson`
