1. Receive the request. `src/api/routes/bubbles.route.ts#postBubble`
2. Parse the body shape. Return HTTP 400 when it is wrong. `src/api/routes/bubbles.schema.ts#parseCreateBubbleBody`
3. Validate the title. Return HTTP 400 when it is not valid. `src/domain/bubble.rules.ts#validateTitle`
4. Make the bubble with the state `open`, a new id and the creation time. Save it. `src/domain/bubble.service.ts#createBubble`
5. Return HTTP 201 with the bubble. `src/api/http.ts#sendJson`
