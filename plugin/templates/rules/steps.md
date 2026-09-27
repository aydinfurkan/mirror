# Rule: `steps.md`

Path: `.mirror/xsrc/<project>/<flow-or-page>/steps.md`.

## Sections

- One `## N. <step>` header per step. Start at 1.
- Under the header, one bullet for each detail.
- The last bullet is `- Code: ` with the code reference in backticks.
- Write one step per function that does a distinct part of the work.

## Code reference

- The form is `path#function`.
- The path is relative to the project root in `.mirror/config.json`.
- Keep each reference true. Name the function of a new step, also when the function does
  not exist yet.

## Example

See `.mirror/rules/examples/steps.md`.
