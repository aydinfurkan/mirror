# BubbleCode — Project Structure Design

- **Date:** 2026-08-21
- **Status:** Approved
- **Topic:** Prompt-first repository structure, drift-checked call graph, prompt visualizer, and the `/add-feature` skill.

## 1. Purpose

BubbleCode separates *intent* from *implementation*. Intent lives in `prompts/` as human-readable Markdown. Implementation lives in `code/`. A generated graph links the two and reports where they disagree. `visualize/` renders that graph as an interactive canvas.

Three invariants define the project:

1. Every source file under `code/src/` has exactly one mirror prompt under `prompts/xsrc/`, and every exported function in that file has one entry in that prompt.
2. The prompt is the declared truth. The code is the actual truth. Any gap is *drift*, and drift is visible rather than silent.
3. The visualizer reads prompts only. It never renders source code.

## 2. Repository layout

```
bubblecode/
├── AGENTS.md                     # agent entry point
├── STRUCTURE.md                  # the human-facing explanation of this design
├── package.json                  # npm workspaces root; scripts only, no runtime deps
├── docs/
│   ├── rules.md                  # ASD-STE100 writing rules (pre-existing)
│   └── superpowers/specs/        # design documents
├── prompts/
│   ├── business/                 # BR-XXXX-<slug>.md  — business rules
│   ├── technical/                # ADR-XXXX-<slug>.md — technical decisions
│   └── xsrc/                     # mirrors code/src/** 1:1, one .md per source file
├── code/
│   ├── src/                      # application source
│   ├── test/                     # mirrors src/ path-for-path
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
└── visualize/
    ├── scripts/build-graph.ts    # prompt parser + code parser + drift diff
    ├── scripts/__tests__/        # fixture-driven tests for the parser
    ├── src/                      # React canvas application
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

There is no top-level `tools/` folder. The graph and drift tooling lives in `visualize/scripts/` because its only consumer is the canvas. The repository root exposes it through npm workspace scripts so it stays available to CI and to agents:

| Script | Effect |
| --- | --- |
| `npm run graph` | Build `visualize/src/generated/graph.json`. |
| `npm run check:drift` | Build the graph. Exit non-zero if the graph contains any drift. |
| `npm test` | Run the `code` tests and the `visualize` tests. |
| `npm run dev:api` | Start the API in watch mode. |
| `npm run dev:viz` | Build the graph, then start the Vite dev server. |

Root `package.json` declares `workspaces: ["code", "visualize"]`.

## 3. Identifier scheme

Resolvable identifiers are what make cross-file links possible.

| Entity | Identifier form | Example |
| --- | --- | --- |
| Business rule | `BR-####` | `BR-0003` |
| Technical decision | `ADR-####` | `ADR-0002` |
| Source file | path relative to `code/src`, extension removed | `domain/bubble.service` |
| Function | `<source file id>#<function name>` | `domain/bubble.service#createBubble` |
| xsrc prompt | `xsrc/<source file id>` | `xsrc/domain/bubble.service` |

Numbers are zero-padded to four digits and are never reused. Find the next free number by listing the folder.

## 4. Prompt file schemas

Every prompt file is Markdown with YAML frontmatter. The frontmatter is the machine source of truth for the graph. The Markdown body is prose for humans, written under `docs/rules.md` (ASD-STE100 Simplified Technical English, one imperative instruction per sentence, active voice).

The parser preserves unknown frontmatter keys and ignores them. Missing optional keys default to an empty list.

### 4.1 `prompts/business/BR-####-<slug>.md`

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

### 4.2 `prompts/technical/ADR-####-<slug>.md`

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

### 4.3 `prompts/xsrc/<source file id>.md`

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

Every function entry requires `input`, `output`, and `responsibility`. This is the four-part prompt shape the project is built around: function name, input, output, responsibility.

## 5. Graph builder and drift checker

`visualize/scripts/build-graph.ts` runs three stages.

**Stage 1 — prompts pass.** Read every file under `prompts/`. Parse the frontmatter with `gray-matter`. Validate it against the schemas in section 4 with `zod`. Emit nodes for each rule, decision, xsrc file, and function. Emit edges for `relates_to`, `driven_by`, `supersedes`, `implements`, `decisions`, `implemented_by`, and `calls`.

**Stage 2 — code pass.** Walk `code/src/**/*.ts` with `ts-morph`. For each file, collect its **exported** function declarations. For each function, collect the identifiers it calls that resolve to an exported function in the same file or in another `code/src` file. This produces the *actual* function set and the *actual* call edges.

The parser ignores functions that a file does not export. Prompts document the contract between files, so a private helper needs no prompt entry and can change without a prompt edit. The parser also ignores `code/test/`: tests derive from the acceptance criteria of a business rule, which is already a prompt.

**Stage 3 — diff.** Compare stage 1 against stage 2. Attach a `drift[]` array to the affected nodes and edges.

| Kind | Condition | Attached to |
| --- | --- | --- |
| `missing-prompt` | A source file has no xsrc mirror. | file node |
| `orphan-prompt` | An xsrc mirror has no source file. | file node |
| `missing-function` | A function exists in code but not in the prompt. | file node |
| `orphan-function` | A function exists in the prompt but not in code. | function node |
| `call-drift` | A declared call edge is absent in code, or an actual call edge is not declared. | edge |
| `broken-ref` | A frontmatter reference names an id that no node matches. | referring node |

Every drift entry carries `kind`, a human-readable `message`, and the `id` it concerns. Nothing aborts the build. `npm run graph` always writes a complete `graph.json`, so the canvas can render every problem, including a typo in a reference. Only `npm run check:drift` turns drift into a non-zero exit code.

A `broken-ref` produces no edge, because the edge has no target to point at. The builder attaches the drift entry to the node that made the reference and records the unresolved id in the message.

The mirror requirement excludes files matching `code/src/**/*.d.ts`, `index.ts` barrel files, and any glob listed in `prompts/.xsrcignore`.

### 5.1 Output shape

`visualize/src/generated/graph.json`:

```jsonc
{
  "generatedAt": "2026-08-21T00:00:00.000Z",
  "nodes": [
    {
      "id": "BR-0003",
      "kind": "business",                        // business | technical | file | function
      "title": "Bubble completion",
      "tab": "business",                         // business | technical | xsrc
      "parent": null,                            // set on function nodes: the file node id
      "data": {},                                // the frontmatter fields for this node
      "body": "rendered Markdown body",
      "drift": []
    }
  ],
  "edges": [
    {
      "id": "BR-0003->domain/bubble.service#completeBubble",
      "source": "BR-0003",
      "target": "domain/bubble.service#completeBubble",
      "kind": "implemented_by",                  // relates_to | driven_by | supersedes | implements | decisions | implemented_by | calls
      "tab": "cross",                            // business | technical | xsrc | cross
      "drift": []
    }
  ],
  "driftSummary": {
    "missing-prompt": 0,
    "orphan-prompt": 0,
    "missing-function": 0,
    "orphan-function": 0,
    "call-drift": 0,
    "broken-ref": 0
  }
}
```

## 6. Visualizer

Vite, React, TypeScript, and `@xyflow/react` for the pan and zoom canvas.

Three tabs read one dataset, filtered by the `tab` field:

- **business** — business rule nodes, `relates_to` edges.
- **technical** — decision nodes, `driven_by` and `supersedes` edges.
- **xsrc** — function nodes grouped inside file container nodes, `calls` edges between them.

A **show implementations** switch controls the cross-layer edges. The switch is off by default, which keeps each tab readable as its own view. Turn the switch on to pull the linked nodes of the other tabs into the current view, so you can trace a business rule down to the functions that implement it. The side panel jump-links work in both states.

Layout uses `dagre` for a deterministic top-down arrangement. The application computes node positions at render time and never stores them, so the graph needs no manual maintenance.

Selecting a node opens a side panel. The panel shows the rendered prompt body, the frontmatter fields, any drift badges, and jump-links to the related nodes in the other two tabs. Selecting a jump-link switches the tab and focuses that node.

A drift banner above the canvas shows the `driftSummary` counts. Selecting the banner filters the view to the drifting nodes.

The application reads `graph.json` and nothing else. It has no access to `code/src`. This keeps the promise that the canvas visualizes prompts.

## 7. Test application

A bubble tracker API proves the whole chain end to end. A *bubble* is one unit of work.

The layers give the call graph real cross-file depth:

```
api/routes/bubbles.route.ts  →  domain/bubble.service.ts  →  infra/bubble.repo.memory.ts
                                domain/bubble.rules.ts        (implements domain/bubble.port.ts)
```

Business rules to author:

| Id | Rule |
| --- | --- |
| BR-0001 | Create a bubble with a title and an owner. |
| BR-0002 | Reject a bubble whose title is empty or longer than 120 characters. |
| BR-0003 | Complete a bubble. Do not complete a bubble twice. |
| BR-0004 | List the bubbles of one owner. Show the newest bubble first. |

Technical decisions to author:

| Id | Decision |
| --- | --- |
| ADR-0001 | Use TypeScript on Node for the application and for the tooling. |
| ADR-0002 | Store bubbles in memory behind a repository port. |
| ADR-0003 | Validate request bodies at the route boundary with `zod`. |

Docker Compose runs the API service alone. The design omits a database on purpose, so the test application stays fast and dependency-free. ADR-0002 records that choice and its consequences.

Tests live in `code/test/` and mirror `code/src/` path for path. The test runner is vitest.

## 8. The `/add-feature` skill

The skill lives at `.claude/skills/add-feature/SKILL.md`. It is prompt-first: the business rule, then the technical decision, then the prompts, then the tests, then the code.

1. **Read the rules.** Load `docs/rules.md` and `STRUCTURE.md`.
2. **Interview for the business rule.** Ask one question at a time: actor, trigger, outcome, edge cases, acceptance criteria. Write `prompts/business/BR-XXXX-<slug>.md`. **Approval gate.**
3. **Interview for the technical decisions.** Determine which existing ADRs apply. Write a new ADR only when the feature makes a genuinely new decision. Otherwise cite the existing ADRs in the xsrc prompt. **Approval gate.**
4. **Propose the implementation plan.** List the source files to create or change, the function signatures, and the new call edges. **Approval gate.**
5. **Write the xsrc prompts** for every affected file. Include the four-part entry for every function.
6. **Write the tests, then the code.** Follow test-driven development.
7. **Verify.** Run `npm run check:drift` and `npm test`. Report the real output.

The three gates exist because each stage constrains the next. A skipped gate produces code that disagrees with a prompt nobody approved.

## 9. Testing strategy

| Area | Approach |
| --- | --- |
| Graph builder | Test-first, against fixture directories under `visualize/scripts/__tests__/fixtures/`. One fixture per drift kind, one fixture that proves the parser ignores private functions, and a clean fixture that must report zero drift. This is the riskiest component and gets the most coverage. |
| Test application | Test-driven, vitest. Unit tests per layer, plus one route-level integration test per business rule. |
| Visualizer | A small number of render tests: the tab switch, the side panel, and the drift banner. No exhaustive component coverage. |

## 10. Out of scope

- Any database, migration tooling, or persistence beyond the in-memory repository.
- Authentication and authorization in the test application.
- Editing prompts inside the visualizer. The canvas is read-only.
- Source languages other than TypeScript in the code parser.
- Automatic repair of drift. The checker reports. A human or the `/add-feature` skill fixes.
