# Rule: `boundary.md`

Path: `.mirror/xsrc/<project>/<flow-or-page>/boundary.md`. The contract of the flow.

## Sections

- `## Input`: the trigger line (endpoint, queue, script or route), then one table row per
  input field: path, query, body or message field. Put the shape limits (type, required,
  length, format) in the Validation column. When the input has a body or a message, add a
  `json` example of it.
- `## Output`: one table row per result: each status code, event or effect, with each error.
  Add a `json` example of the success body and of one error body.
- `## Dependencies`: a bullet list of databases, queues, external APIs, and other flows.

## Pages

- The Input table lists the route params, the query and the form fields.
- The Output table has the columns `Result`, `Shows` and `When`: one row for each view,
  move to another route, and alert.
- The Dependencies list the API flows that the page calls.
- A page needs no `json` examples.

## Example

````markdown
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
````
