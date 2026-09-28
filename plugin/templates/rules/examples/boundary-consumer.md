## Input

Topic `user.created`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `userId` | string | yes | not empty |
| `email` | string | yes | valid email |

Example:

```json
{ "userId": "u1", "email": "ada@example.com" }
```

## Output

| Result | When |
| --- | --- |
| Publish `welcome-email.requested` | The message is valid. |
| Send the message to the dead-letter queue | The message is not valid. |

Example (published):

```json
{ "userId": "u1", "template": "welcome" }
```

## Dependencies

- Topic `welcome-email.requested`.
