## Input

`POST /users`, JSON body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `email` | string | yes | valid email, at most 254 characters |

## Auth

- Public: anyone can sign up.

## Output

| Status | Body | When |
| --- | --- | --- |
| 201 | `User` | The user is created. |
| 400 | `{ error: { code: "validation", field, message } }` | A field fails its validation. |

## Dependencies

- writes `users-db`: saves the user with `UserRepository.save`.
