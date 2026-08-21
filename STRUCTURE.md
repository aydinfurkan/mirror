# BubbleCode Structure

BubbleCode keeps intent and implementation in separate folders, and links them with a
generated graph.

- `prompts/` holds intent. A human reads it.
- `code/` holds implementation. A machine runs it.
- `visualize/` builds the graph that links the two, and draws it on a canvas.

## The three prompt folders

| Folder              | Holds                    | Filename              |
| ------------------- | ------------------------ | --------------------- |
| `prompts/business`  | Business rules           | `BR-####-<slug>.md`   |
| `prompts/technical` | Technical decisions      | `ADR-####-<slug>.md`  |
| `prompts/xsrc`      | One mirror per code file | `<path under code/src>.md` |

`prompts/xsrc` clones the shape of `code/src`. The file `code/src/domain/bubble.service.ts`
has the mirror `prompts/xsrc/domain/bubble.service.md`. The mirror describes every exported
function with four parts: the name, the input, the output, and the responsibility.

## Identifiers

| Entity              | Form                                           | Example                              |
| ------------------- | ---------------------------------------------- | ------------------------------------ |
| Business rule       | `BR-####`                                       | `BR-0003`                            |
| Technical decision  | `ADR-####`                                      | `ADR-0002`                           |
| Source file         | path under `code/src`, extension removed        | `domain/bubble.service`              |
| Function            | `<file id>#<function name>`                     | `domain/bubble.service#createBubble` |
| xsrc prompt         | `xsrc/<file id>`                                | `xsrc/domain/bubble.service`         |

Pad every number to four digits. Never reuse a number. Find the next free number by listing
the folder.

## Frontmatter schemas

### Business rules: `prompts/business/BR-####-<slug>.md`

```yaml
---
id: BR-0003                                             # required, matches filename
type: business                                          # required, literal
title: Bubble completion                                # required
status: draft | active | superseded                     # required
relates_to: [BR-0001]                                   # optional, other BR ids
implemented_by: [domain/bubble.service#completeBubble]  # optional, function ids
---
## Rule
## Rationale
## Acceptance criteria
```

### Technical decisions: `prompts/technical/ADR-####-<slug>.md`

```yaml
---
id: ADR-0002                                       # required, matches filename
type: technical                                    # required, literal
title: In-memory repository behind a port          # required
status: proposed | accepted | superseded           # required
date: 2026-08-21                                   # required, ISO 8601
driven_by: [BR-0001]                               # optional, BR ids
applies_to: [code/src/infra/**]                    # optional, glob patterns
supersedes: []                                     # optional, ADR ids
---
## Context
## Decision
## Consequences
## Alternatives considered
```

### Code mirrors: `prompts/xsrc/<source file id>.md`

```yaml
---
id: xsrc/api/routes/bubbles.route                  # required, matches path
type: xsrc                                         # required, literal
mirrors: code/src/api/routes/bubbles.route.ts      # required, repo-relative
implements: [BR-0001, BR-0002]                     # optional, BR ids
decisions: [ADR-0002, ADR-0003]                    # optional, ADR ids
functions:                                         # required, may be empty
  - name: postBubble                               # required
    input: "Accept an HTTP request. The JSON body contains a title and an ownerId."
    output: "Return HTTP 201 with the new bubble. Return HTTP 400 with a validation error."
    responsibility: "Validate the request body. Call createBubble. Map the result to an HTTP response."
    calls: [domain/bubble.service#createBubble]    # optional, function ids
---
## Notes
```

## Drift

The graph builder reads the prompts, then reads the code, then compares them. A disagreement
is drift.

| Kind               | Meaning                                                     |
| ------------------ | ----------------------------------------------------------- |
| `missing-prompt`   | A source file has no mirror prompt.                          |
| `orphan-prompt`    | A mirror prompt has no source file.                          |
| `missing-function` | A function exists in code but not in the prompt.             |
| `orphan-function`  | A function exists in the prompt but not in code.             |
| `call-drift`       | A declared call is absent in code, or an actual call is undeclared. |
| `broken-ref`       | A reference names an id that no node matches.                |

Drift never stops a build. Run `npm run check:drift` to turn drift into a failure.

Only exported functions are parsed. `code/test/` is never mirrored. `**/*.d.ts` files and any path
listed in `prompts/.xsrcignore` are excluded from the mirror requirement.

## Commands

| Command                | Effect                                                    |
| ---------------------- | --------------------------------------------------------- |
| `npm run graph`        | Build `visualize/src/generated/graph.json`.                |
| `npm run check:drift`  | Build the graph. Fail if the graph contains drift.         |
| `npm test`             | Build the graph, then run every test.                      |
| `npm run dev:api`      | Start the API in watch mode.                               |
| `npm run dev:viz`      | Build the graph, then start the canvas.                    |

## Adding a feature

Use the `/add-feature` skill. It asks for the business rule, then the technical decision,
then it writes the prompts, the tests, and the code, in that order.
