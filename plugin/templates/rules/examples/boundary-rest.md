## Input

`POST /users`, JSON body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `email` | string | yes | valid email, at most 254 characters |

Example:

```json
{ "email": "ada@example.com" }
```

## Output

| Status | Body | When |
| --- | --- | --- |
| 201 | `User` | The user is created. |
| 400 | `{ error: { code: "validation", field, message } }` | A field fails its validation. |

Example (201):

```json
{ "id": "u1", "email": "ada@example.com" }
```

Example (400):

```json
{ "error": { "code": "validation", "field": "email", "message": "Email is not valid." } }
```

## Dependencies

- `UserRepository.save`
