## Input

Topic `user.created`:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `userId` | string | yes | not empty |
| `email` | string | yes | valid email |

## Auth

- None: the flow trusts each message on the topic.

## Output

| Result | When |
| --- | --- |
| Publish `welcome-email.requested` | The message is valid. |
| Send the message to the dead-letter queue | The message is not valid. |

## Dependencies

- consumes `user-created`: the message that starts this flow.
- publishes `welcome-email-requested`: when the message is valid.
- publishes `user-created-dlq`: when the message is not valid.
