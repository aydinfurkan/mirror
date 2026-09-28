## Input

`POST /posts`, JSON body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `title` | string | yes | 1–120 characters, at least one visible character |
| `body` | string | yes | 1–10000 characters, at least one visible character |
| `authorId` | string | yes | not empty |

Example:

```json
{ "title": "Hello", "body": "My first post.", "authorId": "u1" }
```

## Output

| Status | Body | When |
| --- | --- | --- |
| 201 | `Post` (`updatedAt` equals `createdAt`) | The post is created. |
| 400 | `{ error: { code: "validation", field, message } }` | A field fails its validation. |
| 500 | `{ error: { code: "unexpected", field: "server", message } }` | The server fails. |

Example (201):

```json
{
  "id": "p1",
  "title": "Hello",
  "body": "My first post.",
  "authorId": "u1",
  "createdAt": "2026-09-27T10:00:00.000Z",
  "updatedAt": "2026-09-27T10:00:00.000Z"
}
```

Example (400):

```json
{ "error": { "code": "validation", "field": "title", "message": "Enter a title." } }
```

## Dependencies

- `PostRepository.save` (in memory).
- `now()` and `newId()` from `src/infra/system.deps.ts`.
