1. Receive the request. Read `ownerId` from the path. `src/api/routes/bubbles.route.ts#getBubblesByOwner`
2. Load the bubbles of the owner. `src/domain/bubble.service.ts#listBubblesByOwner`
3. Sort the bubbles newest first. `src/domain/bubble.rules.ts#sortNewestFirst`
4. Return HTTP 200 with the list. `src/api/http.ts#sendJson`
