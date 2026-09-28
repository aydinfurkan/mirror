## 1. Validate the request body
- Return HTTP 400 when it is not valid.
- Code: `src/users/users.schema.ts#parseCreateUser`

## 2. Save the user
- Code: `src/users/users.service.ts#createUser`
