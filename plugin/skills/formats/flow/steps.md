# Rule: flow `steps.md`

Path: `.mirror/xsrc/<project>/<flow>/steps.md`. Use it for `backend`, `worker` and `consumer`
flows.

## Sections

- One `## N. <step>` header per step. Start at 1.
- Under the header, one bullet for each detail.
- When the step can fail, add one `- Fail: ` bullet per kind of failure, after the other
  bullets. Write what the flow does then: stop with an error, roll back, retry or skip.
- Write one step per function that does a distinct part of the work.

## Example

See `examples/flow/steps.md`.
