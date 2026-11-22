# Rule: flow `flow.md`

Path: `.mirror/xsrc/<project>/<flow>/flow.md`. Use it for `backend`, `worker` and `consumer`
flows. It shows the flow from start to end: an example input, the steps, and the example
results.

## Sections

In this order:

- `## Input`: one example of the input. See "Example blocks". Write `- None.` when the flow
  has no input body.
- One `## N. <step>` header per step. Start at 1.
  - Under the header, one bullet for each detail.
  - When the step can fail, add one `- Fail: ` bullet per kind of failure, after the other
    bullets. Write what the flow does then: stop with an error, roll back, retry or skip.
  - Write one step per function that does a distinct part of the work.
- `## Output`: one example of the success result and one example of an error. See "Example
  blocks". Write `- None.` when the flow has no output body.

The fields, the types and the limits of the input and the output are in `contract.md`, not
here.

## Example blocks

- Show real values, not types.
- Use the fence language of the real format: `json`, `graphql`, `proto`, `sh` or `text`.
- Put a label line before each fence: `Example:`, `Example (201):`, `Example (400):`.

| Kind | Input example | Output example |
| --- | --- | --- |
| `backend` (REST) | The request body in `json`. | The response body in `json`: the success and one error. |
| `backend` (GraphQL) | The query in `graphql`, then the variables in `json`. | The response in `json`, with `data` or `errors`. |
| `backend` (RPC) | The request message in `json` or `proto`. | The response message and one error status. |
| `consumer` | The message payload in `json`. Add the headers or the key when they matter. | The published event in `json`, or the written record. |
| `worker` | The command line, the cron line, or the env vars in `sh`. | The written record or the published event, the log line, and the exit code. |

## Examples

- REST endpoint: `examples/flow/flow-rest.md`
- Consumer: `examples/flow/flow-consumer.md`
