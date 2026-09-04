# Mirror Structure

Mirror keeps intent and implementation in separate folders, and links them with a
generated graph.

- `.mirror/docs/` holds intent. A human reads it.
- `code/` holds implementation. A machine runs it.
- `.mirror/visualize/` builds the graph that links the two, and draws it on a canvas.

## Configuration

`.mirror/config.json` holds every project-specific value.

| Key   | Meaning                                                        | Default                    |
| ----- | -------------------------------------------------------------- | -------------------------- |
| `src` | One source root per tab, repository-relative.                   | `{ "xsrc": "code/src" }`   |

`src` takes one path or a map. One path becomes the `xsrc` tab:

```json
{ "src": "code/src" }
```

A map gives each source root its own tab, its own prompt folder, and its own canvas:

```json
{
  "src": {
    "api": "services/api/src",
    "web": "apps/web/src"
  }
}
```

Each key names a tab. A key must not be `business` or `technical`. Every path in this
document that says `code/src` means the source root of that tab, and every path that says
`xsrc` means that tab name. An absent `config.json` keeps the default.

## The prompt folders

| Folder                   | Holds                    | Filename                   |
| ------------------------ | ------------------------ | -------------------------- |
| `.mirror/docs/business`  | Business rules           | `BR-####-<slug>.md`        |
| `.mirror/docs/technical` | Technical decisions      | `ADR-####-<slug>.md`       |
| `.mirror/docs/<tab>`     | One mirror per code file | `<path under that root>.md` |

`business` and `technical` are always present. One more folder exists for each key in `src`.

`.mirror/docs/xsrc` clones the shape of `code/src`. The file `code/src/domain/bubble.service.ts`
has the mirror `.mirror/docs/xsrc/domain/bubble.service.md`. The mirror describes every exported
function with four parts: the name, the input, the output, and the responsibility.

## Identifiers

| Entity              | Form                                           | Example                              |
| ------------------- | ---------------------------------------------- | ------------------------------------ |
| Business rule       | `BR-####`                                       | `BR-0003`                            |
| Technical decision  | `ADR-####`                                      | `ADR-0002`                           |
| Source file         | `<tab>/<path under that root>`, extension removed | `xsrc/domain/bubble.service`       |
| Function            | `<file id>#<function name>`                     | `xsrc/domain/bubble.service#createBubble` |

The tab prefix keeps two source roots that hold the same relative path apart.

Pad every number to four digits. Never reuse a number. Find the next free number by listing
the folder.

## Frontmatter schemas

### Business rules: `.mirror/docs/business/BR-####-<slug>.md`

```yaml
---
id: BR-0003                                             # required, matches filename
type: business                                          # required, literal
title: Bubble completion                                # required
status: draft | active | superseded                     # required
relates_to: [BR-0001]                                   # optional, other BR ids
implemented_by: [xsrc/domain/bubble.service#completeBubble]  # optional, function ids
---
## Rule
## Rationale
## Acceptance criteria
```

### Technical decisions: `.mirror/docs/technical/ADR-####-<slug>.md`

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

### Code mirrors: `.mirror/docs/<tab>/<path under that root>.md`

```yaml
---
id: xsrc/api/routes/bubbles.route                  # required, matches path
type: xsrc                                         # required, the tab name
mirrors: code/src/api/routes/bubbles.route.ts      # required, repo-relative
implements: [BR-0001, BR-0002]                     # optional, BR ids
decisions: [ADR-0002, ADR-0003]                    # optional, ADR ids
functions:                                         # required, may be empty
  - name: postBubble                               # required
    input: "Accept an HTTP request. The JSON body contains a title and an ownerId."
    output: "Return HTTP 201 with the new bubble. Return HTTP 400 with a validation error."
    responsibility: "Validate the request body. Call createBubble. Map the result to an HTTP response."
    calls: [xsrc/domain/bubble.service#createBubble]  # optional, function ids
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

Drift never stops a build. Run `pnpm -C .mirror/visualize check:drift` to turn drift into a failure.

Only exported functions are parsed. `code/test/` is never mirrored. `**/*.d.ts` files and any path
listed in `.mirror/docs/.xsrcignore` are excluded from the mirror requirement.

## Commands

Run every command from the repository root.

| Command                                  | Effect                                             |
| ---------------------------------------- | -------------------------------------------------- |
| `pnpm -C .mirror/visualize graph`        | Build `.mirror/visualize/src/generated/graph.json`. |
| `pnpm -C .mirror/visualize check:drift`  | Build the graph. Fail if the graph contains drift.  |
| `pnpm -C .mirror/visualize test`         | Run the canvas and graph-builder tests.             |
| `pnpm -C .mirror/visualize dev`          | Build the graph, then start the canvas.             |
| `npm -C code run dev`                    | Start the API in watch mode.                        |
| `npm -C code run test`                   | Run the API tests.                                  |

There is no package at the repository root. Each part installs its own dependencies.

## Use Mirror in another project

Copy `.mirror/` into the other repository, then:

1. Delete the content of `.mirror/docs/business/`, `.mirror/docs/technical/`, and
   `.mirror/docs/xsrc/`. Keep the folders and `.mirror/docs/.xsrcignore`.
2. Set `src` in `.mirror/config.json`. Create one prompt folder under `.mirror/docs/`
   for each key you declare, and delete `.mirror/docs/xsrc/` when you do not use that name.
3. Create `AGENTS.md` at the repository root with one line: read `.mirror/AGENTS.md`.
4. Add `.mirror/visualize/src/generated/` to `.gitignore`.
5. Run `pnpm -C .mirror/visualize install`, then `pnpm -C .mirror/visualize graph`.

The graph builder parses TypeScript only. It uses ts-morph and reads `**/*.ts` under `src`.
A project in another language needs a new parser in `.mirror/visualize/scripts/lib/parse-code.ts`.

## Adding a feature

Work in this order. Never reverse it.

1. Write the business rule in `.mirror/docs/business/`.
2. Write a technical decision in `.mirror/docs/technical/`, but only when no existing decision
   covers the feature.
3. Write or update the xsrc prompts for every file you will touch.
4. Write the failing tests.
5. Write the code that passes them.
6. Run `pnpm -C .mirror/visualize check:drift`. It must report `0 drift`.
