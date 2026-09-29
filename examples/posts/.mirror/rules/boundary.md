# Rule: `boundary.md`

Path: `.mirror/xsrc/<project>/<flow-or-page>/boundary.md`. The contract of the flow.

## Sections

- `## Input`: the trigger line (endpoint, queue, script or route), then one table row per
  input field: path, query, body or message field. Put the shape limits (type, required,
  length, format) in the Validation column. Then one example of the input.
- `## Output`: one table row per result: each status code, event or effect, with each error.
  Then one example of the success result and one example of an error.
- `## Dependencies`: one bullet per link to another flow, project or external system. Write
  other needs (a helper, a repository in memory) as plain bullets. See "Links".

## Links

Write each link as one bullet:

```md
- calls `api/create-post`: sends the form values.
- writes `posts-db`: saves the post.
- publishes `post-events`
```

- Start the bullet with one verb: `calls`, `publishes`, `consumes`, `reads` or `writes`.
- Put the target in backticks: `<project>/<flow>`, `<project>` when the flow is not known, or the
  id of an external system in `config.json`.
- Add `: <note>` to tell why. The note is optional.
- Do not add text after the target without `: `. The check fails on ``- reads `db` (in memory).``
- Add each database, queue, cache, storage or API outside the repository to `external` in
  `.mirror/config.json` before you link to it:

```json
"external": {
  "posts-db": { "kind": "database", "name": "Postgres" },
  "post-events": { "kind": "queue", "name": "Kafka topic post.events" }
}
```

- Use one of these kinds: `database`, `queue`, `cache`, `storage`, `api`, `service`.
- Do not give an external system the id of a project.
- A bullet that does not start with a verb is a plain note. The viewer does not draw it.

## Example blocks

- Show real values, not types.
- Use the fence language of the real format: `json`, `graphql`, `proto`, `sh` or `text`.
- Put a label line before each fence: `Example:`, `Example (201):`, `Example (400):`.
- Skip an example when there is no input or no output body.

| Kind | Input example | Output example |
| --- | --- | --- |
| `backend` (REST) | The request body in `json`. | The response body in `json`: the success and one error. |
| `backend` (GraphQL) | The query in `graphql`, then the variables in `json`. | The response in `json`, with `data` or `errors`. |
| `backend` (RPC) | The request message in `json` or `proto`. | The response message and one error status. |
| `consumer` | The message payload in `json`. Add the headers or the key when they matter. | The published event in `json`, or the written record. |
| `worker` | The command line, the cron line, or the env vars in `sh`. | The written record or the published event, the log line, and the exit code. |
| `frontend`, `expo` | The form values in `json`, when the page has a form. The route in `text`, when it has a query. | None. The Output table is enough. |

## Pages

- The Input table lists the route params, the query and the form fields.
- The Output table has the columns `Result`, `Shows` and `When`: one row for each view,
  move to another route, and alert.
- The Dependencies list a `calls` link to each API flow that the page calls.

## Examples

- REST endpoint: `.mirror/rules/examples/boundary-rest.md`
- Consumer: `.mirror/rules/examples/boundary-consumer.md`
