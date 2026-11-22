# Rule: project `definition.md`

Path: `.mirror/xsrc/<project>/definition.md`.

## Sections

- The first paragraph: what the project is for. The viewer shows it on the project row.
- `## Stack`: the language, the framework, the main libraries, and how to start it.
- `## Technical decisions`: the choices that apply to many flows or pages: storage,
  validation, error mapping, auth.
- `## Glossary`: one bullet per business word that has another name in the code. Write the
  business word, then `: ` and the code name in backticks: ``- Listing: `Post` ``. Write
  `- None.` when each business word is also the code name.

## Example

See `examples/project/definition.md`.
