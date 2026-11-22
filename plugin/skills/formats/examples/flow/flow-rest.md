## Input

Example:

```json
{ "email": "ada@example.com" }
```

## 1. Validate the request body
- Fail: return HTTP 400 when it is not valid.

## 2. Save the user

## Output

Example (201):

```json
{ "id": "u1", "email": "ada@example.com" }
```

Example (400):

```json
{ "error": { "code": "validation", "field": "email", "message": "Email is not valid." } }
```
