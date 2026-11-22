## Input

Example:

```json
{ "userId": "u1", "email": "ada@example.com" }
```

## 1. Validate the message
- Fail: send the message to the dead-letter queue when it is not valid.

## 2. Publish the welcome email request

## Output

Example (published):

```json
{ "userId": "u1", "template": "welcome" }
```
