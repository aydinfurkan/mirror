# BubbleCode Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a prompt-first repository where every source file has a mirror prompt, a generated graph links prompts to code and reports drift, and a React canvas visualizes the prompts.

**Architecture:** Three top-level folders. `prompts/` holds Markdown-with-frontmatter intent files in three kinds (business rules, technical decisions, xsrc mirrors). `code/` holds a TypeScript bubble-tracker API plus its infra. `visualize/` holds both the graph builder (a Node script that parses prompts and code, diffs them, and emits `graph.json`) and the React canvas that renders it. npm workspaces tie them together.

**Tech Stack:** TypeScript 5, Node 20+, npm workspaces, Express 4, zod 3, vitest 2, supertest, ts-morph, gray-matter, React 18, Vite 5, `@xyflow/react` 12, `@dagrejs/dagre`.

**Spec:** [docs/superpowers/specs/2026-08-21-bubblecode-structure-design.md](../specs/2026-08-21-bubblecode-structure-design.md)

## Global Constraints

- **Prose style:** Every Markdown body in `prompts/**` follows `docs/rules.md` — ASD-STE100 Simplified Technical English, one imperative instruction per sentence, active voice. This applies to the `input`, `output`, and `responsibility` frontmatter strings too.
- **Node:** 20 or later. `"engines": { "node": ">=20" }` in every `package.json`.
- **TypeScript:** `"strict": true`, `"module": "ESNext"`, `"moduleResolution": "Bundler"`, `"target": "ES2022"`, `"verbatimModuleSyntax": true`. All source is ESM: every `package.json` sets `"type": "module"`, and every relative import ends in `.js`.
- **Ids:** `BR-####` and `ADR-####`, zero-padded to four digits, never reused. File ids: path relative to `code/src` without the extension. Function ids: `<file id>#<functionName>`.
- **Parser scope:** Only **exported** function declarations are parsed and documented. `code/test/` is never mirrored.
- **Mirror exclusions:** `**/*.d.ts` plus every glob listed in `prompts/.xsrcignore`. There is no hardcoded barrel-file rule; `**/index.ts` lives in `.xsrcignore` instead.
- **Drift never fails a build.** `npm run graph` always writes a complete `graph.json`. Only `npm run check:drift` exits non-zero.
- **No database.** In-memory repository only, behind a port.
- **Commit after every task.** Conventional Commit prefixes (`feat:`, `test:`, `docs:`, `chore:`).

---

## File Structure

**Root**
| File | Responsibility |
| --- | --- |
| `package.json` | Workspace root. Scripts only, no runtime dependencies. |
| `.gitignore` | Ignore `node_modules`, `dist`, `visualize/src/generated`. |
| `STRUCTURE.md` | Human-facing explanation of the three folders and the prompt schemas. |
| `AGENTS.md` | Agent entry point. Renamed from Atlas to BubbleCode. |
| `prompts/.xsrcignore` | Globs excluded from the mirror requirement. |

**`code/` — the bubble tracker API (11 source files)**
| File | Responsibility |
| --- | --- |
| `src/main.ts` | Compose the dependencies. Start the HTTP server. |
| `src/api/server.ts` | Build the Express application and mount the routes. |
| `src/api/http.ts` | Write JSON responses and validation-error responses. |
| `src/api/routes/bubbles.route.ts` | Bind HTTP routes to service calls. |
| `src/api/routes/bubbles.schema.ts` | Parse and validate request bodies with zod. |
| `src/domain/bubble.model.ts` | The `Bubble` type and its states. Types only. |
| `src/domain/bubble.port.ts` | The `BubbleRepository` interface. Types only. |
| `src/domain/bubble.rules.ts` | Pure business rules: title validation, completability, ordering. |
| `src/domain/bubble.service.ts` | Use cases: create, complete, list. |
| `src/infra/bubble.repo.memory.ts` | In-memory implementation of the repository port. |
| `src/infra/system.deps.ts` | Real clock and real id generator. |

**`visualize/` — tooling plus canvas**
| File | Responsibility |
| --- | --- |
| `src/graph/types.ts` | Graph, node, edge, and drift types. Shared by scripts and UI. |
| `scripts/lib/paths.ts` | Convert between file paths and ids. Match ignore globs. |
| `scripts/lib/parse-prompts.ts` | Stage 1. Read `prompts/**` into nodes and edge intents. |
| `scripts/lib/parse-code.ts` | Stage 2. Read `code/src/**` into actual functions and calls. |
| `scripts/lib/diff.ts` | Stage 3. Diff the two passes and attach drift. |
| `scripts/build-graph.ts` | CLI. Orchestrate the stages, write the file, set the exit code. |
| `src/App.tsx` | Tab state, cross-edge toggle, selection state. |
| `src/layout.ts` | Run dagre over the filtered nodes and edges. |
| `src/components/TabBar.tsx` | The three tabs and the show-implementations switch. |
| `src/components/Canvas.tsx` | The React Flow canvas. |
| `src/components/SidePanel.tsx` | Prompt body, fields, drift badges, jump-links. |
| `src/components/DriftBanner.tsx` | Drift counts and the drift-only filter. |

**`.claude/skills/add-feature/SKILL.md`** — the feature workflow.

---

### Task 1: Repository scaffold and STRUCTURE.md

**Files:**
- Create: `package.json`, `.gitignore`, `STRUCTURE.md`, `prompts/.xsrcignore`
- Create: `prompts/business/.gitkeep`, `prompts/technical/.gitkeep`, `prompts/xsrc/.gitkeep`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: nothing.
- Produces: npm workspaces named `code` and `visualize`; root scripts `graph`, `check:drift`, `test`, `dev:api`, `dev:viz`. Later tasks add the workspace packages these scripts point at.

- [ ] **Step 1: Create the root `package.json`**

```json
{
  "name": "bubblecode",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "workspaces": ["code", "visualize"],
  "scripts": {
    "graph": "npm --workspace visualize run graph",
    "check:drift": "npm --workspace visualize run graph -- --check",
    "test": "npm run graph && npm --workspace code run test && npm --workspace visualize run test",
    "dev:api": "npm --workspace code run dev",
    "dev:viz": "npm run graph && npm --workspace visualize run dev"
  }
}
```

- [ ] **Step 2: Create `.gitignore`**

```gitignore
node_modules/
dist/
.env
visualize/src/generated/
*.log
```

- [ ] **Step 3: Create `prompts/.xsrcignore`**

```
# Globs under code/src that need no mirror prompt in prompts/xsrc.
# One glob per line. Lines that start with # are comments.
**/index.ts
```

- [ ] **Step 4: Create the empty prompt folders**

```bash
mkdir -p prompts/business prompts/technical prompts/xsrc
touch prompts/business/.gitkeep prompts/technical/.gitkeep prompts/xsrc/.gitkeep
```

- [ ] **Step 5: Rewrite `AGENTS.md`**

```markdown
# BubbleCode — Agent Instructions

## What to read

| Document                         | Read                                      |
| -------------------------------- | ----------------------------------------- |
| [docs/rules.md](docs/rules.md)   | Before anything else, every single time   |
| [STRUCTURE.md](STRUCTURE.md)     | Before you touch `prompts/` or `code/`    |

## The one rule that matters

Write the prompt before you write the code. Every file in `code/src/` has a mirror
prompt in `prompts/xsrc/`. Run `npm run check:drift` before you report that you are done.

## Adding a feature

Use the `/add-feature` skill. Do not add a business rule by hand.
```

- [ ] **Step 6: Write `STRUCTURE.md`**

Write the file with these sections. Copy the schemas verbatim from the spec, sections 3 and 4.

````markdown
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

[Copy sections 4.1, 4.2, and 4.3 of the design spec here, verbatim, including the comments
that mark each field required or optional.]

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

Only exported functions are parsed. `code/test/` is never mirrored. `prompts/.xsrcignore`
lists the paths that need no mirror.

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
````

- [ ] **Step 7: Verify the workspace root parses**

Run: `npm pkg get workspaces`
Expected: `["code","visualize"]`. The workspace packages do not exist yet, so do not run `npm install`.

- [ ] **Step 8: Commit**

```bash
git add package.json .gitignore STRUCTURE.md AGENTS.md prompts/
git commit -m "chore: scaffold BubbleCode workspace and document the structure"
```

---

### Task 2: Code workspace and the domain core

**Files:**
- Create: `code/package.json`, `code/tsconfig.json`, `code/vitest.config.ts`
- Create: `code/src/domain/bubble.model.ts`, `code/src/domain/bubble.port.ts`, `code/src/domain/bubble.rules.ts`
- Test: `code/test/domain/bubble.rules.test.ts`

**Interfaces:**
- Consumes: the workspace root from Task 1.
- Produces:
  - `type BubbleState = 'open' | 'done'`
  - `interface Bubble { id: string; title: string; ownerId: string; state: BubbleState; createdAt: string; completedAt: string | null }`
  - `interface ValidationError { field: string; message: string }`
  - `interface BubbleRepository { save(b: Bubble): Promise<void>; findById(id: string): Promise<Bubble | null>; findByOwner(ownerId: string): Promise<Bubble[]> }`
  - `const MAX_TITLE_LENGTH = 120`
  - `validateTitle(title: string): ValidationError | null`
  - `isCompletable(bubble: Bubble): boolean`
  - `sortNewestFirst(bubbles: Bubble[]): Bubble[]`

- [ ] **Step 1: Create `code/package.json`**

```json
{
  "name": "code",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "start": "tsx src/main.ts",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "express": "^4.19.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.14.0",
    "@types/supertest": "^6.0.2",
    "supertest": "^7.0.0",
    "tsx": "^4.16.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create `code/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "verbatimModuleSyntax": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["src/**/*.ts", "test/**/*.ts"]
}
```

- [ ] **Step 3: Create `code/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Install**

Run: `npm install`
Expected: success. The `visualize` workspace does not exist yet, and npm tolerates that.

- [ ] **Step 5: Write the failing test**

Create `code/test/domain/bubble.rules.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Bubble } from '../../src/domain/bubble.model.js';
import {
  MAX_TITLE_LENGTH,
  isCompletable,
  sortNewestFirst,
  validateTitle,
} from '../../src/domain/bubble.rules.js';

function bubble(overrides: Partial<Bubble> = {}): Bubble {
  return {
    id: 'b1',
    title: 'Ship the parser',
    ownerId: 'u1',
    state: 'open',
    createdAt: '2026-08-21T10:00:00.000Z',
    completedAt: null,
    ...overrides,
  };
}

describe('validateTitle', () => {
  it('accepts a normal title', () => {
    expect(validateTitle('Ship the parser')).toBeNull();
  });

  it('rejects an empty title', () => {
    expect(validateTitle('')).toEqual({ field: 'title', message: 'Enter a title.' });
  });

  it('rejects a whitespace-only title', () => {
    expect(validateTitle('   ')).toEqual({ field: 'title', message: 'Enter a title.' });
  });

  it('accepts a title of exactly the maximum length', () => {
    expect(validateTitle('x'.repeat(MAX_TITLE_LENGTH))).toBeNull();
  });

  it('rejects a title longer than the maximum length', () => {
    expect(validateTitle('x'.repeat(MAX_TITLE_LENGTH + 1))).toEqual({
      field: 'title',
      message: 'Use 120 characters or fewer in the title.',
    });
  });
});

describe('isCompletable', () => {
  it('allows an open bubble to be completed', () => {
    expect(isCompletable(bubble({ state: 'open' }))).toBe(true);
  });

  it('refuses a bubble that is already done', () => {
    expect(isCompletable(bubble({ state: 'done' }))).toBe(false);
  });
});

describe('sortNewestFirst', () => {
  it('puts the newest bubble first', () => {
    const older = bubble({ id: 'old', createdAt: '2026-08-20T10:00:00.000Z' });
    const newer = bubble({ id: 'new', createdAt: '2026-08-21T10:00:00.000Z' });
    expect(sortNewestFirst([older, newer]).map((b) => b.id)).toEqual(['new', 'old']);
  });

  it('does not mutate the input array', () => {
    const input = [
      bubble({ id: 'old', createdAt: '2026-08-20T10:00:00.000Z' }),
      bubble({ id: 'new', createdAt: '2026-08-21T10:00:00.000Z' }),
    ];
    sortNewestFirst(input);
    expect(input.map((b) => b.id)).toEqual(['old', 'new']);
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm --workspace code run test`
Expected: FAIL — cannot resolve `../../src/domain/bubble.rules.js`.

- [ ] **Step 7: Write `code/src/domain/bubble.model.ts`**

```ts
export type BubbleState = 'open' | 'done';

export interface Bubble {
  id: string;
  title: string;
  ownerId: string;
  state: BubbleState;
  createdAt: string;
  completedAt: string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}
```

- [ ] **Step 8: Write `code/src/domain/bubble.port.ts`**

```ts
import type { Bubble } from './bubble.model.js';

export interface BubbleRepository {
  save(bubble: Bubble): Promise<void>;
  findById(id: string): Promise<Bubble | null>;
  findByOwner(ownerId: string): Promise<Bubble[]>;
}
```

- [ ] **Step 9: Write `code/src/domain/bubble.rules.ts`**

```ts
import type { Bubble, ValidationError } from './bubble.model.js';

export const MAX_TITLE_LENGTH = 120;

export function validateTitle(title: string): ValidationError | null {
  if (title.trim().length === 0) {
    return { field: 'title', message: 'Enter a title.' };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return {
      field: 'title',
      message: `Use ${MAX_TITLE_LENGTH} characters or fewer in the title.`,
    };
  }
  return null;
}

export function isCompletable(bubble: Bubble): boolean {
  return bubble.state === 'open';
}

export function sortNewestFirst(bubbles: Bubble[]): Bubble[] {
  return [...bubbles].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
```

- [ ] **Step 10: Run the tests to verify they pass**

Run: `npm --workspace code run test`
Expected: PASS, 9 tests.

- [ ] **Step 11: Commit**

```bash
git add code/
git commit -m "feat(code): add the bubble domain model, port, and rules"
```

---

### Task 3: The service layer

**Files:**
- Create: `code/src/domain/bubble.service.ts`
- Test: `code/test/domain/bubble.service.test.ts`

**Interfaces:**
- Consumes: `Bubble`, `ValidationError`, `BubbleRepository`, `validateTitle`, `isCompletable`, `sortNewestFirst` from Task 2.
- Produces:
  - `interface ServiceDeps { repo: BubbleRepository; now(): string; newId(): string }`
  - `interface CreateBubbleInput { title: string; ownerId: string }`
  - `type ServiceResult<T> = { ok: true; value: T } | { ok: false; error: ServiceError }`
  - `interface ServiceError { code: 'validation' | 'not-found' | 'conflict'; field: string; message: string }`
  - `createBubble(deps: ServiceDeps, input: CreateBubbleInput): Promise<ServiceResult<Bubble>>`
  - `completeBubble(deps: ServiceDeps, id: string): Promise<ServiceResult<Bubble>>`
  - `listBubblesByOwner(deps: ServiceDeps, ownerId: string): Promise<ServiceResult<Bubble[]>>`

Dependencies arrive as an explicit first argument rather than through a closure. This keeps every use case an exported function, which is what the graph builder can see.

- [ ] **Step 1: Write the failing test**

Create `code/test/domain/bubble.service.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import type { Bubble } from '../../src/domain/bubble.model.js';
import type { BubbleRepository } from '../../src/domain/bubble.port.js';
import {
  completeBubble,
  createBubble,
  listBubblesByOwner,
  type ServiceDeps,
} from '../../src/domain/bubble.service.js';

function fakeRepo(seed: Bubble[] = []): BubbleRepository {
  const store = new Map(seed.map((b) => [b.id, b]));
  return {
    async save(bubble) {
      store.set(bubble.id, bubble);
    },
    async findById(id) {
      return store.get(id) ?? null;
    },
    async findByOwner(ownerId) {
      return [...store.values()].filter((b) => b.ownerId === ownerId);
    },
  };
}

let deps: ServiceDeps;
let clock: number;
let counter: number;

beforeEach(() => {
  clock = Date.UTC(2026, 7, 21, 10, 0, 0);
  counter = 0;
  deps = {
    repo: fakeRepo(),
    now: () => new Date((clock += 1000)).toISOString(),
    newId: () => `b${++counter}`,
  };
});

describe('createBubble', () => {
  it('creates an open bubble', async () => {
    const result = await createBubble(deps, { title: 'Ship it', ownerId: 'u1' });
    expect(result).toEqual({
      ok: true,
      value: {
        id: 'b1',
        title: 'Ship it',
        ownerId: 'u1',
        state: 'open',
        createdAt: '2026-08-21T10:00:01.000Z',
        completedAt: null,
      },
    });
  });

  it('stores the bubble', async () => {
    await createBubble(deps, { title: 'Ship it', ownerId: 'u1' });
    expect(await deps.repo.findById('b1')).not.toBeNull();
  });

  it('rejects an invalid title and stores nothing', async () => {
    const result = await createBubble(deps, { title: '  ', ownerId: 'u1' });
    expect(result).toEqual({
      ok: false,
      error: { code: 'validation', field: 'title', message: 'Enter a title.' },
    });
    expect(await deps.repo.findById('b1')).toBeNull();
  });
});

describe('completeBubble', () => {
  it('marks an open bubble as done', async () => {
    const created = await createBubble(deps, { title: 'Ship it', ownerId: 'u1' });
    if (!created.ok) throw new Error('setup failed');
    const result = await completeBubble(deps, created.value.id);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.state).toBe('done');
    expect(result.value.completedAt).toBe('2026-08-21T10:00:02.000Z');
  });

  it('reports a missing bubble', async () => {
    const result = await completeBubble(deps, 'nope');
    expect(result).toEqual({
      ok: false,
      error: { code: 'not-found', field: 'id', message: 'Find no bubble with this id.' },
    });
  });

  it('refuses to complete a bubble twice', async () => {
    const created = await createBubble(deps, { title: 'Ship it', ownerId: 'u1' });
    if (!created.ok) throw new Error('setup failed');
    await completeBubble(deps, created.value.id);
    const second = await completeBubble(deps, created.value.id);
    expect(second).toEqual({
      ok: false,
      error: { code: 'conflict', field: 'state', message: 'This bubble is already done.' },
    });
  });
});

describe('listBubblesByOwner', () => {
  it('returns the newest bubble first', async () => {
    await createBubble(deps, { title: 'First', ownerId: 'u1' });
    await createBubble(deps, { title: 'Second', ownerId: 'u1' });
    const result = await listBubblesByOwner(deps, 'u1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((b) => b.title)).toEqual(['Second', 'First']);
  });

  it('excludes the bubbles of another owner', async () => {
    await createBubble(deps, { title: 'Mine', ownerId: 'u1' });
    await createBubble(deps, { title: 'Theirs', ownerId: 'u2' });
    const result = await listBubblesByOwner(deps, 'u1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((b) => b.title)).toEqual(['Mine']);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm --workspace code run test`
Expected: FAIL — cannot resolve `../../src/domain/bubble.service.js`.

- [ ] **Step 3: Write `code/src/domain/bubble.service.ts`**

```ts
import type { Bubble } from './bubble.model.js';
import type { BubbleRepository } from './bubble.port.js';
import { isCompletable, sortNewestFirst, validateTitle } from './bubble.rules.js';

export interface ServiceDeps {
  repo: BubbleRepository;
  now(): string;
  newId(): string;
}

export interface CreateBubbleInput {
  title: string;
  ownerId: string;
}

export interface ServiceError {
  code: 'validation' | 'not-found' | 'conflict';
  field: string;
  message: string;
}

export type ServiceResult<T> = { ok: true; value: T } | { ok: false; error: ServiceError };

export async function createBubble(
  deps: ServiceDeps,
  input: CreateBubbleInput,
): Promise<ServiceResult<Bubble>> {
  const invalid = validateTitle(input.title);
  if (invalid) {
    return { ok: false, error: { code: 'validation', ...invalid } };
  }
  const bubble: Bubble = {
    id: deps.newId(),
    title: input.title,
    ownerId: input.ownerId,
    state: 'open',
    createdAt: deps.now(),
    completedAt: null,
  };
  await deps.repo.save(bubble);
  return { ok: true, value: bubble };
}

export async function completeBubble(
  deps: ServiceDeps,
  id: string,
): Promise<ServiceResult<Bubble>> {
  const found = await deps.repo.findById(id);
  if (!found) {
    return {
      ok: false,
      error: { code: 'not-found', field: 'id', message: 'Find no bubble with this id.' },
    };
  }
  if (!isCompletable(found)) {
    return {
      ok: false,
      error: { code: 'conflict', field: 'state', message: 'This bubble is already done.' },
    };
  }
  const completed: Bubble = { ...found, state: 'done', completedAt: deps.now() };
  await deps.repo.save(completed);
  return { ok: true, value: completed };
}

export async function listBubblesByOwner(
  deps: ServiceDeps,
  ownerId: string,
): Promise<ServiceResult<Bubble[]>> {
  const owned = await deps.repo.findByOwner(ownerId);
  return { ok: true, value: sortNewestFirst(owned) };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm --workspace code run test`
Expected: PASS, 17 tests total.

- [ ] **Step 5: Commit**

```bash
git add code/
git commit -m "feat(code): add the bubble service use cases"
```

---

### Task 4: The in-memory repository and system dependencies

**Files:**
- Create: `code/src/infra/bubble.repo.memory.ts`, `code/src/infra/system.deps.ts`
- Test: `code/test/infra/bubble.repo.memory.test.ts`

**Interfaces:**
- Consumes: `Bubble`, `BubbleRepository` from Task 2; `ServiceDeps` from Task 3.
- Produces:
  - `createMemoryBubbleRepository(): BubbleRepository`
  - `createSystemDeps(repo: BubbleRepository): ServiceDeps`

- [ ] **Step 1: Write the failing test**

Create `code/test/infra/bubble.repo.memory.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Bubble } from '../../src/domain/bubble.model.js';
import { createMemoryBubbleRepository } from '../../src/infra/bubble.repo.memory.js';

function bubble(overrides: Partial<Bubble> = {}): Bubble {
  return {
    id: 'b1',
    title: 'Ship the parser',
    ownerId: 'u1',
    state: 'open',
    createdAt: '2026-08-21T10:00:00.000Z',
    completedAt: null,
    ...overrides,
  };
}

describe('createMemoryBubbleRepository', () => {
  it('returns null for an unknown id', async () => {
    const repo = createMemoryBubbleRepository();
    expect(await repo.findById('nope')).toBeNull();
  });

  it('saves and reads a bubble back', async () => {
    const repo = createMemoryBubbleRepository();
    await repo.save(bubble());
    expect(await repo.findById('b1')).toEqual(bubble());
  });

  it('overwrites a bubble that has the same id', async () => {
    const repo = createMemoryBubbleRepository();
    await repo.save(bubble());
    await repo.save(bubble({ state: 'done' }));
    const found = await repo.findById('b1');
    expect(found?.state).toBe('done');
  });

  it('filters by owner', async () => {
    const repo = createMemoryBubbleRepository();
    await repo.save(bubble({ id: 'b1', ownerId: 'u1' }));
    await repo.save(bubble({ id: 'b2', ownerId: 'u2' }));
    const owned = await repo.findByOwner('u1');
    expect(owned.map((b) => b.id)).toEqual(['b1']);
  });

  it('gives each repository its own store', async () => {
    const first = createMemoryBubbleRepository();
    const second = createMemoryBubbleRepository();
    await first.save(bubble());
    expect(await second.findById('b1')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm --workspace code run test`
Expected: FAIL — cannot resolve `../../src/infra/bubble.repo.memory.js`.

- [ ] **Step 3: Write `code/src/infra/bubble.repo.memory.ts`**

```ts
import type { Bubble } from '../domain/bubble.model.js';
import type { BubbleRepository } from '../domain/bubble.port.js';

export function createMemoryBubbleRepository(): BubbleRepository {
  const store = new Map<string, Bubble>();
  return {
    async save(bubble) {
      store.set(bubble.id, bubble);
    },
    async findById(id) {
      return store.get(id) ?? null;
    },
    async findByOwner(ownerId) {
      return [...store.values()].filter((bubble) => bubble.ownerId === ownerId);
    },
  };
}
```

- [ ] **Step 4: Write `code/src/infra/system.deps.ts`**

```ts
import { randomUUID } from 'node:crypto';
import type { BubbleRepository } from '../domain/bubble.port.js';
import type { ServiceDeps } from '../domain/bubble.service.js';

export function createSystemDeps(repo: BubbleRepository): ServiceDeps {
  return {
    repo,
    now: () => new Date().toISOString(),
    newId: () => randomUUID(),
  };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm --workspace code run test`
Expected: PASS, 22 tests total.

- [ ] **Step 6: Commit**

```bash
git add code/
git commit -m "feat(code): add the in-memory repository and system dependencies"
```

---

### Task 5: The HTTP layer

**Files:**
- Create: `code/src/api/http.ts`, `code/src/api/routes/bubbles.schema.ts`, `code/src/api/routes/bubbles.route.ts`, `code/src/api/server.ts`, `code/src/main.ts`
- Test: `code/test/api/routes/bubbles.route.test.ts`

**Interfaces:**
- Consumes: `ServiceDeps`, `ServiceError`, `createBubble`, `completeBubble`, `listBubblesByOwner` from Task 3; `createMemoryBubbleRepository`, `createSystemDeps` from Task 4.
- Produces:
  - `sendJson(res: Response, status: number, body: unknown): void`
  - `sendServiceError(res: Response, error: ServiceError): void`
  - `parseCreateBubbleBody(body: unknown): { ok: true; value: CreateBubbleInput } | { ok: false; error: ServiceError }`
  - `registerBubbleRoutes(router: Router, deps: ServiceDeps): void`
  - `postBubble(deps: ServiceDeps, req: Request, res: Response): Promise<void>`
  - `postBubbleComplete(deps: ServiceDeps, req: Request, res: Response): Promise<void>`
  - `getBubblesByOwner(deps: ServiceDeps, req: Request, res: Response): Promise<void>`
  - `createServer(deps: ServiceDeps): Express`
  - `main(): void`

The handlers are exported functions that take `deps` first. `registerBubbleRoutes` wires them into the router with thin arrow functions. This keeps every handler visible to the graph builder as a real call edge.

- [ ] **Step 1: Write the failing test**

Create `code/test/api/routes/bubbles.route.test.ts`:

```ts
import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ServiceDeps } from '../../../src/domain/bubble.service.js';
import { createMemoryBubbleRepository } from '../../../src/infra/bubble.repo.memory.js';
import { createServer } from '../../../src/api/server.js';

let deps: ServiceDeps;
let app: express.Express;

beforeEach(() => {
  let clock = Date.UTC(2026, 7, 21, 10, 0, 0);
  let counter = 0;
  deps = {
    repo: createMemoryBubbleRepository(),
    now: () => new Date((clock += 1000)).toISOString(),
    newId: () => `b${++counter}`,
  };
  app = createServer(deps);
});

describe('POST /bubbles', () => {
  it('creates a bubble and returns 201', async () => {
    const res = await request(app).post('/bubbles').send({ title: 'Ship it', ownerId: 'u1' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 'b1',
      title: 'Ship it',
      ownerId: 'u1',
      state: 'open',
      createdAt: '2026-08-21T10:00:01.000Z',
      completedAt: null,
    });
  });

  it('returns 400 when the title is empty', async () => {
    const res = await request(app).post('/bubbles').send({ title: '', ownerId: 'u1' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: { code: 'validation', field: 'title', message: 'Enter a title.' },
    });
  });

  it('returns 400 when ownerId is missing', async () => {
    const res = await request(app).post('/bubbles').send({ title: 'Ship it' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation');
    expect(res.body.error.field).toBe('ownerId');
  });
});

describe('POST /bubbles/:id/complete', () => {
  it('completes an open bubble', async () => {
    await request(app).post('/bubbles').send({ title: 'Ship it', ownerId: 'u1' });
    const res = await request(app).post('/bubbles/b1/complete').send();
    expect(res.status).toBe(200);
    expect(res.body.state).toBe('done');
  });

  it('returns 404 for an unknown bubble', async () => {
    const res = await request(app).post('/bubbles/nope/complete').send();
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('not-found');
  });

  it('returns 409 when the bubble is already done', async () => {
    await request(app).post('/bubbles').send({ title: 'Ship it', ownerId: 'u1' });
    await request(app).post('/bubbles/b1/complete').send();
    const res = await request(app).post('/bubbles/b1/complete').send();
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('conflict');
  });
});

describe('GET /owners/:ownerId/bubbles', () => {
  it('lists the bubbles of the owner, newest first', async () => {
    await request(app).post('/bubbles').send({ title: 'First', ownerId: 'u1' });
    await request(app).post('/bubbles').send({ title: 'Second', ownerId: 'u1' });
    await request(app).post('/bubbles').send({ title: 'Theirs', ownerId: 'u2' });
    const res = await request(app).get('/owners/u1/bubbles');
    expect(res.status).toBe(200);
    expect(res.body.map((b: { title: string }) => b.title)).toEqual(['Second', 'First']);
  });
});

describe('GET /health', () => {
  it('reports that the service is up', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm --workspace code run test`
Expected: FAIL — cannot resolve `../../../src/api/server.js`.

- [ ] **Step 3: Write `code/src/api/http.ts`**

```ts
import type { Response } from 'express';
import type { ServiceError } from '../domain/bubble.service.js';

const STATUS_BY_CODE: Record<ServiceError['code'], number> = {
  validation: 400,
  'not-found': 404,
  conflict: 409,
};

export function sendJson(res: Response, status: number, body: unknown): void {
  res.status(status).json(body);
}

export function sendServiceError(res: Response, error: ServiceError): void {
  sendJson(res, STATUS_BY_CODE[error.code], { error });
}
```

- [ ] **Step 4: Write `code/src/api/routes/bubbles.schema.ts`**

```ts
import { z } from 'zod';
import type { CreateBubbleInput, ServiceError } from '../../domain/bubble.service.js';

const createBubbleBody = z.object({
  title: z.string(),
  ownerId: z.string().min(1),
});

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: ServiceError };

export function parseCreateBubbleBody(body: unknown): ParseResult<CreateBubbleInput> {
  const parsed = createBubbleBody.safeParse(body);
  if (parsed.success) {
    return { ok: true, value: parsed.data };
  }
  const first = parsed.error.issues[0];
  return {
    ok: false,
    error: {
      code: 'validation',
      field: String(first?.path[0] ?? 'body'),
      message: 'Send a title string and a non-empty ownerId string.',
    },
  };
}
```

- [ ] **Step 5: Write `code/src/api/routes/bubbles.route.ts`**

```ts
import type { Request, Response, Router } from 'express';
import {
  completeBubble,
  createBubble,
  listBubblesByOwner,
  type ServiceDeps,
} from '../../domain/bubble.service.js';
import { sendJson, sendServiceError } from '../http.js';
import { parseCreateBubbleBody } from './bubbles.schema.js';

export async function postBubble(
  deps: ServiceDeps,
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = parseCreateBubbleBody(req.body);
  if (!parsed.ok) {
    sendServiceError(res, parsed.error);
    return;
  }
  const result = await createBubble(deps, parsed.value);
  if (!result.ok) {
    sendServiceError(res, result.error);
    return;
  }
  sendJson(res, 201, result.value);
}

export async function postBubbleComplete(
  deps: ServiceDeps,
  req: Request,
  res: Response,
): Promise<void> {
  const result = await completeBubble(deps, String(req.params.id));
  if (!result.ok) {
    sendServiceError(res, result.error);
    return;
  }
  sendJson(res, 200, result.value);
}

export async function getBubblesByOwner(
  deps: ServiceDeps,
  req: Request,
  res: Response,
): Promise<void> {
  const result = await listBubblesByOwner(deps, String(req.params.ownerId));
  if (!result.ok) {
    sendServiceError(res, result.error);
    return;
  }
  sendJson(res, 200, result.value);
}

export function registerBubbleRoutes(router: Router, deps: ServiceDeps): void {
  router.post('/bubbles', (req, res) => {
    void postBubble(deps, req, res);
  });
  router.post('/bubbles/:id/complete', (req, res) => {
    void postBubbleComplete(deps, req, res);
  });
  router.get('/owners/:ownerId/bubbles', (req, res) => {
    void getBubblesByOwner(deps, req, res);
  });
}
```

- [ ] **Step 6: Write `code/src/api/server.ts`**

```ts
import express, { type Express } from 'express';
import type { ServiceDeps } from '../domain/bubble.service.js';
import { sendJson } from './http.js';
import { registerBubbleRoutes } from './routes/bubbles.route.js';

export function createServer(deps: ServiceDeps): Express {
  const app = express();
  app.use(express.json());
  app.get('/health', (_req, res) => {
    sendJson(res, 200, { status: 'ok' });
  });
  registerBubbleRoutes(app, deps);
  return app;
}
```

- [ ] **Step 7: Write `code/src/main.ts`**

```ts
import { createServer } from './api/server.js';
import { createMemoryBubbleRepository } from './infra/bubble.repo.memory.js';
import { createSystemDeps } from './infra/system.deps.js';

export function main(): void {
  const port = Number(process.env.PORT ?? 3000);
  const deps = createSystemDeps(createMemoryBubbleRepository());
  const app = createServer(deps);
  app.listen(port, () => {
    console.log(`BubbleCode API listens on port ${port}.`);
  });
}

main();
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npm --workspace code run test`
Expected: PASS, 30 tests total.

- [ ] **Step 9: Run the typecheck**

Run: `npm --workspace code run typecheck`
Expected: no output, exit 0.

- [ ] **Step 10: Commit**

```bash
git add code/
git commit -m "feat(code): add the HTTP layer and the server entry point"
```

---

### Task 6: Container and environment

**Files:**
- Create: `code/Dockerfile`, `code/docker-compose.yml`, `code/.dockerignore`, `code/.env.example`

**Interfaces:**
- Consumes: `code/src/main.ts` from Task 5.
- Produces: a container image that serves `/health` on the port from `PORT`.

- [ ] **Step 1: Create `code/.env.example`**

```dotenv
# The port the API listens on.
PORT=3000
```

- [ ] **Step 2: Create `code/.dockerignore`**

```
node_modules
test
.env
*.log
```

- [ ] **Step 3: Create `code/Dockerfile`**

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev && npm install tsx@^4.16.0

COPY tsconfig.json ./
COPY src ./src

ENV PORT=3000
EXPOSE 3000
CMD ["npx", "tsx", "src/main.ts"]
```

- [ ] **Step 4: Create `code/docker-compose.yml`**

```yaml
services:
  api:
    build: .
    ports:
      - "${PORT:-3000}:3000"
    environment:
      PORT: 3000
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
      interval: 10s
      timeout: 3s
      retries: 3
```

There is no database service. ADR-0002 records that decision.

- [ ] **Step 5: Verify the image builds and answers**

Run:
```bash
cd code && docker compose up --build -d && sleep 5 && curl -sf http://localhost:3000/health && docker compose down
```
Expected: `{"status":"ok"}`.

If Docker is unavailable in this environment, say so, skip this step, and note it in the commit body. Do not mark the step done without the output.

- [ ] **Step 6: Commit**

```bash
git add code/
git commit -m "chore(code): add the Dockerfile, compose file, and env example"
```

---

### Task 7: Author the business rules and technical decisions

**Files:**
- Create: `prompts/business/BR-0001-bubble-creation.md`, `BR-0002-bubble-title-limits.md`, `BR-0003-bubble-completion.md`, `BR-0004-owner-bubble-list.md`
- Create: `prompts/technical/ADR-0001-language-and-runtime.md`, `ADR-0002-in-memory-repository.md`, `ADR-0003-boundary-validation.md`
- Delete: `prompts/business/.gitkeep`, `prompts/technical/.gitkeep`

**Interfaces:**
- Consumes: the function ids produced in Tasks 2 through 5.
- Produces: the ids `BR-0001` through `BR-0004` and `ADR-0001` through `ADR-0003`, referenced by the xsrc prompts in Task 8.

Write every body in Simplified Technical English: one imperative instruction per sentence, active voice.

- [ ] **Step 1: Write `prompts/business/BR-0001-bubble-creation.md`**

```markdown
---
id: BR-0001
type: business
title: Bubble creation
status: active
relates_to: [BR-0002]
implemented_by: [domain/bubble.service#createBubble]
---
## Rule

Create a bubble when a user supplies a title and an owner id. Set the state of the new
bubble to `open`. Record the creation time. Give the bubble a unique id.

## Rationale

A bubble is one unit of work. A user needs a bubble before the user can track the work.

## Acceptance criteria

- Return the new bubble with the state `open`.
- Set `completedAt` to null on the new bubble.
- Store the new bubble in the repository.
- Give each bubble a different id.
```

- [ ] **Step 2: Write `prompts/business/BR-0002-bubble-title-limits.md`**

```markdown
---
id: BR-0002
type: business
title: Bubble title limits
status: active
relates_to: [BR-0001]
implemented_by: [domain/bubble.rules#validateTitle]
---
## Rule

Reject a bubble title that contains no visible characters. Reject a bubble title that is
longer than 120 characters.

## Rationale

An empty title tells a reader nothing. A very long title breaks the list view.

## Acceptance criteria

- Reject an empty title.
- Reject a title that contains only whitespace.
- Accept a title of exactly 120 characters.
- Reject a title of 121 characters.
- Store nothing when the title is invalid.
```

- [ ] **Step 3: Write `prompts/business/BR-0003-bubble-completion.md`**

```markdown
---
id: BR-0003
type: business
title: Bubble completion
status: active
relates_to: [BR-0001]
implemented_by: [domain/bubble.service#completeBubble, domain/bubble.rules#isCompletable]
---
## Rule

Set the state of a bubble to `done` when a user completes it. Record the completion time.
Refuse to complete a bubble that is already done.

## Rationale

A user must see which work is finished. A second completion overwrites the first
completion time. The system then loses the history.

## Acceptance criteria

- Change the state from `open` to `done`.
- Set `completedAt` to the completion time.
- Report a not-found error for an unknown bubble id.
- Report a conflict error for a bubble that is already done.
```

- [ ] **Step 4: Write `prompts/business/BR-0004-owner-bubble-list.md`**

```markdown
---
id: BR-0004
type: business
title: Owner bubble list
status: active
relates_to: [BR-0001]
implemented_by: [domain/bubble.service#listBubblesByOwner, domain/bubble.rules#sortNewestFirst]
---
## Rule

List the bubbles of one owner. Show the newest bubble first. Exclude the bubbles of every
other owner.

## Rationale

A user works on their own bubbles. Recent work matters most.

## Acceptance criteria

- Return only the bubbles whose `ownerId` matches the request.
- Order the bubbles by `createdAt`, newest first.
- Return an empty list for an owner who has no bubbles.
```

- [ ] **Step 5: Write `prompts/technical/ADR-0001-language-and-runtime.md`**

```markdown
---
id: ADR-0001
type: technical
title: Use TypeScript on Node for the application and the tooling
status: accepted
date: 2026-08-21
driven_by: [BR-0001]
applies_to: [code/src/**, visualize/**]
supersedes: []
---
## Context

BubbleCode contains an API, a graph builder, and a React canvas. The graph builder must
read the source of the API. It must find the exported functions. It must find the call
sites.

## Decision

Write the API, the graph builder, and the canvas in TypeScript on Node 20 or later. Tie the
three parts together with npm workspaces. Run the tests with vitest.

## Consequences

- One toolchain covers every part of the repository.
- The graph builder uses `ts-morph`. `ts-morph` understands the same source that it parses.
- The code parser supports TypeScript only. A second source language needs a new parser.

## Alternatives considered

- **Python for the API.** The graph builder would need a second parser and a second test
  runner. Two toolchains add cost. They give no benefit here.
- **Go for the API.** Go packages map cleanly onto folders. The canvas stays
  TypeScript. The repository then needs two toolchains.
```

- [ ] **Step 6: Write `prompts/technical/ADR-0002-in-memory-repository.md`**

```markdown
---
id: ADR-0002
type: technical
title: Store bubbles in memory behind a repository port
status: accepted
date: 2026-08-21
driven_by: [BR-0001, BR-0004]
applies_to: [code/src/infra/**, code/src/domain/bubble.port.ts]
supersedes: []
---
## Context

The bubble tracker exists to prove that a business rule reaches code and reaches the canvas.
A database would slow the tests and add a service to every environment.

## Decision

Define a `BubbleRepository` port in the domain. Implement the port with a `Map` held in
process memory. Run the container with no database service.

## Consequences

- The tests run fast and need no fixtures.
- The service restarts empty. The test application keeps no data.
- The domain depends on the port. A real store can replace the implementation later.

## Alternatives considered

- **PostgreSQL through Docker Compose.** This adds a real store, migrations, and a slow test
  suite. It proves nothing about the prompt-to-code link.
- **A file-backed store.** This adds serialization code and gives no benefit over memory.
```

- [ ] **Step 7: Write `prompts/technical/ADR-0003-boundary-validation.md`**

```markdown
---
id: ADR-0003
type: technical
title: Validate request bodies at the route boundary with zod
status: accepted
date: 2026-08-21
driven_by: [BR-0002]
applies_to: [code/src/api/**]
supersedes: []
---
## Context

An HTTP body arrives as unknown JSON. The domain must receive typed input. A business rule
also limits the title, and that rule belongs in the domain, not in the transport layer.

## Decision

Parse the shape of the body at the route boundary with zod. Return HTTP 400 when the shape
is wrong. Keep the title-length rule and the empty-title rule in `domain/bubble.rules.ts`.

## Consequences

- The domain receives typed input and never inspects raw JSON.
- Shape errors and rule errors both return HTTP 400, with different messages.
- A rule change touches the domain only. A payload change touches the schema only.

## Alternatives considered

- **Validate everything in the domain.** The domain would then depend on the transport shape.
- **Trust the client.** A malformed body would crash the handler.
```

- [ ] **Step 8: Remove the placeholder files**

```bash
git rm --cached prompts/business/.gitkeep prompts/technical/.gitkeep
rm -f prompts/business/.gitkeep prompts/technical/.gitkeep
```

- [ ] **Step 9: Commit**

```bash
git add prompts/
git commit -m "docs(prompts): author the bubble tracker business rules and decisions"
```

---

### Task 8: Author the xsrc mirror prompts

**Files:**
- Create eleven files under `prompts/xsrc/`, one per file in `code/src/`:
  `main.md`, `api/server.md`, `api/http.md`, `api/routes/bubbles.route.md`, `api/routes/bubbles.schema.md`, `domain/bubble.model.md`, `domain/bubble.port.md`, `domain/bubble.rules.md`, `domain/bubble.service.md`, `infra/bubble.repo.memory.md`, `infra/system.deps.md`
- Delete: `prompts/xsrc/.gitkeep`

**Interfaces:**
- Consumes: the exported functions from Tasks 2 through 5, and the ids from Task 7.
- Produces: the declared function set and the declared call edges that Task 11 diffs against the real code.

Every function entry needs `name`, `input`, `output`, and `responsibility`. A file that exports only types gets `functions: []`. Declare a `calls` entry only for a call to an exported function in `code/src`. A call to a method on an injected object, such as `deps.repo.save`, is not a call edge.

- [ ] **Step 1: Write the two type-only mirrors**

`prompts/xsrc/domain/bubble.model.md`:

```markdown
---
id: xsrc/domain/bubble.model
type: xsrc
mirrors: code/src/domain/bubble.model.ts
implements: [BR-0001]
decisions: []
functions: []
---
## Notes

Declare the shape of a bubble and the shape of a validation error. Export types only.
```

`prompts/xsrc/domain/bubble.port.md`:

```markdown
---
id: xsrc/domain/bubble.port
type: xsrc
mirrors: code/src/domain/bubble.port.ts
implements: []
decisions: [ADR-0002]
functions: []
---
## Notes

Declare the interface that a bubble store must satisfy. Export the interface only. Keep the
domain free of any storage technology.
```

- [ ] **Step 2: Write `prompts/xsrc/domain/bubble.rules.md`**

```markdown
---
id: xsrc/domain/bubble.rules
type: xsrc
mirrors: code/src/domain/bubble.rules.ts
implements: [BR-0002, BR-0003, BR-0004]
decisions: [ADR-0003]
functions:
  - name: validateTitle
    input: "Accept a title string."
    output: "Return null for a valid title. Return a validation error for an invalid title."
    responsibility: "Reject a title that has no visible characters. Reject a title longer than 120 characters."
    calls: []
  - name: isCompletable
    input: "Accept a bubble."
    output: "Return true when the bubble is open. Return false when the bubble is done."
    responsibility: "Report whether a user can complete this bubble."
    calls: []
  - name: sortNewestFirst
    input: "Accept an array of bubbles."
    output: "Return a new array. Put the newest bubble first."
    responsibility: "Order bubbles by creation time, newest first. Do not change the input array."
    calls: []
---
## Notes

Keep every function in this file pure. Do not read the clock. Do not touch the repository.
```

- [ ] **Step 3: Write `prompts/xsrc/domain/bubble.service.md`**

```markdown
---
id: xsrc/domain/bubble.service
type: xsrc
mirrors: code/src/domain/bubble.service.ts
implements: [BR-0001, BR-0003, BR-0004]
decisions: [ADR-0002]
functions:
  - name: createBubble
    input: "Accept the service dependencies and an input that holds a title and an owner id."
    output: "Return an ok result with the new bubble. Return a failed result with a validation error."
    responsibility: "Validate the title. Build an open bubble. Store the bubble."
    calls: [domain/bubble.rules#validateTitle]
  - name: completeBubble
    input: "Accept the service dependencies and a bubble id."
    output: "Return an ok result with the completed bubble. Return a failed result with a not-found error or a conflict error."
    responsibility: "Find the bubble. Refuse a bubble that is already done. Set the state to done. Store the bubble."
    calls: [domain/bubble.rules#isCompletable]
  - name: listBubblesByOwner
    input: "Accept the service dependencies and an owner id."
    output: "Return an ok result with the bubbles of the owner, newest first."
    responsibility: "Read the bubbles of the owner. Order them, newest first."
    calls: [domain/bubble.rules#sortNewestFirst]
---
## Notes

Take the dependencies as the first argument. Do not build a closure. The graph builder reads
exported functions, so every use case must stay an exported function.
```

- [ ] **Step 4: Write the two infra mirrors**

`prompts/xsrc/infra/bubble.repo.memory.md`:

```markdown
---
id: xsrc/infra/bubble.repo.memory
type: xsrc
mirrors: code/src/infra/bubble.repo.memory.ts
implements: [BR-0001, BR-0004]
decisions: [ADR-0002]
functions:
  - name: createMemoryBubbleRepository
    input: "Accept no argument."
    output: "Return a bubble repository that holds its bubbles in process memory."
    responsibility: "Give each repository its own store. Save a bubble. Find a bubble by id. Find the bubbles of one owner."
    calls: []
---
## Notes

Keep the store private to the returned object. Do not share a store between two repositories.
```

`prompts/xsrc/infra/system.deps.md`:

```markdown
---
id: xsrc/infra/system.deps
type: xsrc
mirrors: code/src/infra/system.deps.ts
implements: []
decisions: [ADR-0002]
functions:
  - name: createSystemDeps
    input: "Accept a bubble repository."
    output: "Return the service dependencies that hold the repository, a real clock, and a real id generator."
    responsibility: "Supply the effects that the domain must not create for itself."
    calls: []
---
## Notes

Keep every real effect in this file. A test supplies its own clock and its own id generator.
```

- [ ] **Step 5: Write the three API mirrors**

`prompts/xsrc/api/http.md`:

```markdown
---
id: xsrc/api/http
type: xsrc
mirrors: code/src/api/http.ts
implements: []
decisions: [ADR-0003]
functions:
  - name: sendJson
    input: "Accept a response, an HTTP status number, and a body value."
    output: "Write the status and the JSON body to the response. Return nothing."
    responsibility: "Write one JSON response."
    calls: []
  - name: sendServiceError
    input: "Accept a response and a service error."
    output: "Write the matching HTTP status and an error body to the response. Return nothing."
    responsibility: "Map a service error code to an HTTP status. Send the error as JSON."
    calls: [api/http#sendJson]
  - name: sendUnexpectedError
    input: "Accept a response."
    output: "Write HTTP 500 with an error body to the response. Return nothing."
    responsibility: "Answer a request that failed for a reason the domain does not describe."
    calls: [api/http#sendJson]
---
## Notes

Map `validation` to 400. Map `not-found` to 404. Map `conflict` to 409. Map every other
failure to 500.
```

`prompts/xsrc/api/routes/bubbles.schema.md`:

```markdown
---
id: xsrc/api/routes/bubbles.schema
type: xsrc
mirrors: code/src/api/routes/bubbles.schema.ts
implements: [BR-0001]
decisions: [ADR-0003]
functions:
  - name: parseCreateBubbleBody
    input: "Accept an unknown request body."
    output: "Return an ok result with a typed create input. Return a failed result with a validation error."
    responsibility: "Check the shape of the body with zod. Report the first invalid field."
    calls: []
---
## Notes

Check the shape only. Keep the title-length rule in the domain.
```

`prompts/xsrc/api/routes/bubbles.route.md`:

```markdown
---
id: xsrc/api/routes/bubbles.route
type: xsrc
mirrors: code/src/api/routes/bubbles.route.ts
implements: [BR-0001, BR-0003, BR-0004]
decisions: [ADR-0003]
functions:
  - name: postBubble
    input: "Accept the service dependencies, an HTTP request, and an HTTP response."
    output: "Write HTTP 201 with the new bubble. Write HTTP 400 with a validation error."
    responsibility: "Parse the request body. Call createBubble. Map the result to an HTTP response."
    calls: [api/routes/bubbles.schema#parseCreateBubbleBody, domain/bubble.service#createBubble, api/http#sendJson, api/http#sendServiceError]
  - name: postBubbleComplete
    input: "Accept the service dependencies, an HTTP request, and an HTTP response."
    output: "Write HTTP 200 with the completed bubble. Write HTTP 404 or HTTP 409 with an error."
    responsibility: "Read the bubble id from the path. Call completeBubble. Map the result to an HTTP response."
    calls: [domain/bubble.service#completeBubble, api/http#sendJson, api/http#sendServiceError]
  - name: getBubblesByOwner
    input: "Accept the service dependencies, an HTTP request, and an HTTP response."
    output: "Write HTTP 200 with the bubbles of the owner, newest first."
    responsibility: "Read the owner id from the path. Call listBubblesByOwner. Map the result to an HTTP response."
    calls: [domain/bubble.service#listBubblesByOwner, api/http#sendJson, api/http#sendServiceError]
  - name: registerBubbleRoutes
    input: "Accept an Express router and the service dependencies."
    output: "Bind three routes onto the router. Return nothing."
    responsibility: "Bind each HTTP route to its handler. Pass the dependencies to the handler. Answer with HTTP 500 when a handler fails unexpectedly."
    calls: [api/routes/bubbles.route#postBubble, api/routes/bubbles.route#postBubbleComplete, api/routes/bubbles.route#getBubblesByOwner, api/http#sendUnexpectedError]
---
## Notes

Keep each handler an exported function. Bind the handler with a thin arrow function, so the
graph builder sees the call. Attach a catch to each handler call. A handler that rejects must
not leave the request without an answer.
```

- [ ] **Step 6: Write the two entry-point mirrors**

`prompts/xsrc/api/server.md`:

```markdown
---
id: xsrc/api/server
type: xsrc
mirrors: code/src/api/server.ts
implements: []
decisions: [ADR-0003]
functions:
  - name: createServer
    input: "Accept the service dependencies."
    output: "Return an Express application that serves the health route and the bubble routes."
    responsibility: "Build the application. Read JSON bodies. Serve a health route. Mount the bubble routes."
    calls: [api/routes/bubbles.route#registerBubbleRoutes, api/http#sendJson]
---
## Notes

Do not listen on a port in this file. A test builds the application without a port.
```

`prompts/xsrc/main.md`:

```markdown
---
id: xsrc/main
type: xsrc
mirrors: code/src/main.ts
implements: []
decisions: [ADR-0001, ADR-0002]
functions:
  - name: main
    input: "Accept no argument. Read the port from the PORT environment variable."
    output: "Start the HTTP server. Return nothing."
    responsibility: "Build the repository. Build the dependencies. Build the server. Listen on the port."
    calls: [infra/bubble.repo.memory#createMemoryBubbleRepository, infra/system.deps#createSystemDeps, api/server#createServer]
---
## Notes

Compose every dependency in this file. Keep the rest of the code free of construction.
```

- [ ] **Step 7: Remove the placeholder file**

```bash
git rm --cached prompts/xsrc/.gitkeep
rm -f prompts/xsrc/.gitkeep
```

- [ ] **Step 8: Verify the mirror is complete by hand**

Run:
```bash
find code/src -name '*.ts' | sed 's|^code/src/||; s|\.ts$||' | sort > /tmp/src.txt
find prompts/xsrc -name '*.md' | sed 's|^prompts/xsrc/||; s|\.md$||' | sort > /tmp/xsrc.txt
diff /tmp/src.txt /tmp/xsrc.txt
```
Expected: no output. Task 11 automates this check.

- [ ] **Step 9: Commit**

```bash
git add prompts/
git commit -m "docs(prompts): mirror every code/src file in prompts/xsrc"
```

---

### Task 9: Visualize workspace, graph types, and the prompt parser

**Files:**
- Create: `visualize/package.json`, `visualize/tsconfig.json`, `visualize/vite.config.ts`, `visualize/vitest.config.ts`, `visualize/index.html`
- Create: `visualize/src/graph/types.ts`, `visualize/scripts/lib/paths.ts`, `visualize/scripts/lib/parse-prompts.ts`
- Test: `visualize/scripts/__tests__/helpers.ts`, `visualize/scripts/__tests__/parse-prompts.test.ts`
- Test fixtures: `visualize/scripts/__tests__/fixtures/clean/**`

**Interfaces:**
- Consumes: the workspace root from Task 1.
- Produces:
  - `types.ts`: `DriftKind`, `Drift`, `TabName`, `NodeKind`, `EdgeKind`, `GraphNode`, `GraphEdge`, `Graph`
  - `paths.ts`: `fileIdFromSrcPath`, `fileIdFromXsrcPath`, `xsrcIdFromFileId`, `functionId`, `readIgnoreGlobs`, `isIgnored`
  - `parse-prompts.ts`: `interface PromptPass { nodes: GraphNode[]; edges: GraphEdge[] }` and `parsePrompts(promptsDir: string): Promise<PromptPass>`

- [ ] **Step 1: Create `visualize/package.json`**

```json
{
  "name": "visualize",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "graph": "tsx scripts/build-graph.ts",
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@dagrejs/dagre": "^1.1.4",
    "@xyflow/react": "^12.3.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^16.0.0",
    "@types/picomatch": "^3.0.1",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "gray-matter": "^4.0.3",
    "jsdom": "^24.1.0",
    "picomatch": "^4.0.2",
    "ts-morph": "^23.0.0",
    "tsx": "^4.16.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create the TypeScript, Vite, and vitest configuration**

`visualize/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "verbatimModuleSyntax": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "resolveJsonModule": true,
    "types": ["node", "vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "scripts/**/*.ts", "vite.config.ts"]
}
```

`visualize/vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
```

`visualize/vitest.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['scripts/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
```

`visualize/src/test-setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

`visualize/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BubbleCode Prompts</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/mount.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Install**

Run: `npm install`
Expected: success, both workspaces linked.

- [ ] **Step 4: Write `visualize/src/graph/types.ts`**

```ts
export type DriftKind =
  | 'missing-prompt'
  | 'orphan-prompt'
  | 'missing-function'
  | 'orphan-function'
  | 'call-drift'
  | 'broken-ref';

export const DRIFT_KINDS: DriftKind[] = [
  'missing-prompt',
  'orphan-prompt',
  'missing-function',
  'orphan-function',
  'call-drift',
  'broken-ref',
];

export interface Drift {
  kind: DriftKind;
  id: string;
  message: string;
}

export type TabName = 'business' | 'technical' | 'xsrc';
export type NodeKind = 'business' | 'technical' | 'file' | 'function';
export type EdgeKind =
  | 'relates_to'
  | 'driven_by'
  | 'supersedes'
  | 'implements'
  | 'decisions'
  | 'implemented_by'
  | 'calls';

export interface GraphNode {
  id: string;
  kind: NodeKind;
  title: string;
  tab: TabName;
  parent: string | null;
  data: Record<string, unknown>;
  body: string;
  drift: Drift[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
  tab: TabName | 'cross';
  drift: Drift[];
}

export interface Graph {
  generatedAt: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  driftSummary: Record<DriftKind, number>;
}
```

- [ ] **Step 5: Write `visualize/scripts/lib/paths.ts`**

```ts
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import picomatch from 'picomatch';

export function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

export function fileIdFromSrcPath(relPath: string): string {
  return toPosix(relPath).replace(/\.tsx?$/, '');
}

export function fileIdFromXsrcPath(relPath: string): string {
  return toPosix(relPath).replace(/\.md$/, '');
}

export function xsrcIdFromFileId(fileId: string): string {
  return `xsrc/${fileId}`;
}

export function fileIdFromXsrcId(xsrcId: string): string {
  return xsrcId.replace(/^xsrc\//, '');
}

export function functionId(fileId: string, name: string): string {
  return `${fileId}#${name}`;
}

export async function readIgnoreGlobs(promptsDir: string): Promise<string[]> {
  try {
    const raw = await readFile(path.join(promptsDir, '.xsrcignore'), 'utf8');
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));
  } catch (error) {
    // An absent .xsrcignore is legitimate. Every source file then needs a mirror.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

export function isIgnored(relPath: string, globs: string[]): boolean {
  const posix = toPosix(relPath);
  if (posix.endsWith('.d.ts')) return true;
  return globs.some((glob) => picomatch.isMatch(posix, glob));
}
```

- [ ] **Step 6: Create the clean fixture**

Create these files under `visualize/scripts/__tests__/fixtures/clean/`.

`code/src/greet.ts`:

```ts
export function greet(name: string): string {
  return `Hello ${name}`;
}
```

`code/src/app.ts`:

```ts
import { greet } from './greet.js';

export function run(): string {
  return greet('world');
}
```

`code/src/index.ts`:

```ts
export { run } from './app.js';
```

`prompts/.xsrcignore`:

```
**/index.ts
```

`prompts/business/BR-0001-greeting.md`:

```markdown
---
id: BR-0001
type: business
title: Greeting
status: active
relates_to: []
implemented_by: [greet#greet]
---
## Rule

Greet the user by name.
```

`prompts/technical/ADR-0001-language.md`:

```markdown
---
id: ADR-0001
type: technical
title: Use TypeScript
status: accepted
date: 2026-08-21
driven_by: [BR-0001]
applies_to: [code/src/**]
supersedes: []
---
## Decision

Write the fixture in TypeScript.
```

`prompts/xsrc/greet.md`:

```markdown
---
id: xsrc/greet
type: xsrc
mirrors: code/src/greet.ts
implements: [BR-0001]
decisions: [ADR-0001]
functions:
  - name: greet
    input: "Accept a name string."
    output: "Return a greeting string."
    responsibility: "Build a greeting from the name."
    calls: []
---
## Notes
```

`prompts/xsrc/app.md`:

```markdown
---
id: xsrc/app
type: xsrc
mirrors: code/src/app.ts
implements: [BR-0001]
decisions: []
functions:
  - name: run
    input: "Accept no argument."
    output: "Return the greeting for the world."
    responsibility: "Call greet with a fixed name."
    calls: [greet#greet]
---
## Notes
```

- [ ] **Step 7: Write the fixture helper**

`visualize/scripts/__tests__/helpers.ts`:

```ts
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const CLEAN_FIXTURE = path.join(here, 'fixtures', 'clean');

const created: string[] = [];

/** Copy the clean fixture into a temporary folder, then apply a mutation to it. */
export async function makeRepo(
  mutate?: (dir: string) => Promise<void>,
): Promise<{ root: string; promptsDir: string; srcDir: string }> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'bubblecode-'));
  created.push(root);
  await cp(CLEAN_FIXTURE, root, { recursive: true });
  if (mutate) await mutate(root);
  return {
    root,
    promptsDir: path.join(root, 'prompts'),
    srcDir: path.join(root, 'code', 'src'),
  };
}

export async function cleanupRepos(): Promise<void> {
  await Promise.all(created.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
}

/** Replace one line of a file, matched by a substring. */
export async function patchFile(
  file: string,
  find: string,
  replace: string,
): Promise<void> {
  const raw = await readFile(file, 'utf8');
  if (!raw.includes(find)) throw new Error(`patchFile found no "${find}" in ${file}`);
  await writeFile(file, raw.replace(find, replace), 'utf8');
}
```

- [ ] **Step 8: Write the failing test**

`visualize/scripts/__tests__/parse-prompts.test.ts`:

```ts
import { afterAll, describe, expect, it } from 'vitest';
import { parsePrompts } from '../lib/parse-prompts.js';
import { cleanupRepos, makeRepo } from './helpers.js';

afterAll(cleanupRepos);

describe('parsePrompts', () => {
  it('emits a node for each business rule, decision, file, and function', async () => {
    const { promptsDir } = await makeRepo();
    const { nodes } = await parsePrompts(promptsDir);
    expect(nodes.map((n) => n.id).sort()).toEqual([
      'ADR-0001',
      'BR-0001',
      'app#run',
      'greet#greet',
      'xsrc/app',
      'xsrc/greet',
    ]);
  });

  it('assigns each node to a tab', async () => {
    const { promptsDir } = await makeRepo();
    const { nodes } = await parsePrompts(promptsDir);
    const byId = new Map(nodes.map((n) => [n.id, n]));
    expect(byId.get('BR-0001')?.tab).toBe('business');
    expect(byId.get('ADR-0001')?.tab).toBe('technical');
    expect(byId.get('xsrc/greet')?.tab).toBe('xsrc');
    expect(byId.get('greet#greet')?.tab).toBe('xsrc');
  });

  it('parents a function node to its file node', async () => {
    const { promptsDir } = await makeRepo();
    const { nodes } = await parsePrompts(promptsDir);
    const fn = nodes.find((n) => n.id === 'greet#greet');
    expect(fn?.kind).toBe('function');
    expect(fn?.parent).toBe('xsrc/greet');
    expect(fn?.data).toMatchObject({
      input: 'Accept a name string.',
      output: 'Return a greeting string.',
      responsibility: 'Build a greeting from the name.',
    });
  });

  it('keeps the Markdown body on the node', async () => {
    const { promptsDir } = await makeRepo();
    const { nodes } = await parsePrompts(promptsDir);
    expect(nodes.find((n) => n.id === 'BR-0001')?.body).toContain('Greet the user by name.');
  });

  it('emits the declared edges with their kinds and tabs', async () => {
    const { promptsDir } = await makeRepo();
    const { edges } = await parsePrompts(promptsDir);
    const summary = edges.map((e) => `${e.source}->${e.target}:${e.kind}:${e.tab}`).sort();
    expect(summary).toEqual([
      'ADR-0001->BR-0001:driven_by:cross',
      'BR-0001->greet#greet:implemented_by:cross',
      'app#run->greet#greet:calls:xsrc',
      'xsrc/app->BR-0001:implements:cross',
      'xsrc/greet->ADR-0001:decisions:cross',
      'xsrc/greet->BR-0001:implements:cross',
    ]);
  });

  it('rejects a prompt whose id does not match its path', async () => {
    const { promptsDir } = await makeRepo(async (root) => {
      const file = `${root}/prompts/xsrc/greet.md`;
      const { patchFile } = await import('./helpers.js');
      await patchFile(file, 'id: xsrc/greet', 'id: xsrc/wrong');
    });
    await expect(parsePrompts(promptsDir)).rejects.toThrow(/xsrc\/wrong/);
  });

  it('rejects a function entry that omits the responsibility', async () => {
    const { promptsDir } = await makeRepo(async (root) => {
      const { patchFile } = await import('./helpers.js');
      await patchFile(
        `${root}/prompts/xsrc/greet.md`,
        '    responsibility: "Build a greeting from the name."\n',
        '',
      );
    });
    await expect(parsePrompts(promptsDir)).rejects.toThrow(/responsibility/);
  });
});
```

- [ ] **Step 9: Run the test to verify it fails**

Run: `npm --workspace visualize run test`
Expected: FAIL — cannot resolve `../lib/parse-prompts.js`.

- [ ] **Step 10: Write `visualize/scripts/lib/parse-prompts.ts`**

```ts
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { EdgeKind, GraphEdge, GraphNode } from '../../src/graph/types.js';
import { fileIdFromXsrcPath, functionId, toPosix, xsrcIdFromFileId } from './paths.js';

export interface PromptPass {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface FunctionEntry {
  name: string;
  input: string;
  output: string;
  responsibility: string;
  calls: string[];
}

/**
 * List every Markdown file under one prompt folder.
 * The three prompt folders are required. A missing folder is a configuration error,
 * not an empty result. A drift report built on silence would look clean.
 */
async function listMarkdown(dir: string): Promise<string[]> {
  const found: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name.endsWith('.md')) found.push(full);
    }
  }
  try {
    await walk(dir);
  } catch (cause) {
    throw new Error(`Cannot read the prompt folder ${toPosix(dir)}. Create the folder.`, {
      cause,
    });
  }
  return found.sort();
}

function requireString(value: unknown, field: string, where: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${where}: the field "${field}" must be a non-empty string.`);
  }
  return value;
}

/**
 * YAML turns an unquoted date scalar such as `date: 2026-08-21` into a native Date.
 * Accept both that and a quoted string, and return the calendar date. An author of a
 * prompt must not have to quote a date, and `graph.json` must not carry a time part.
 */
function requireDateString(value: unknown, where: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return requireString(value, 'date', where);
}

function asList(value: unknown, field: string, where: string): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
    throw new Error(`${where}: the field "${field}" must be a list of strings.`);
  }
  return value as string[];
}

function edge(
  source: string,
  target: string,
  kind: EdgeKind,
  tab: GraphEdge['tab'],
): GraphEdge {
  return { id: `${source}->${target}:${kind}`, source, target, kind, tab, drift: [] };
}

export async function parsePrompts(promptsDir: string): Promise<PromptPass> {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const kind of ['business', 'technical'] as const) {
    for (const file of await listMarkdown(path.join(promptsDir, kind))) {
      const where = toPosix(path.relative(promptsDir, file));
      const { data, content } = matter(await readFile(file, 'utf8'));
      const id = requireString(data.id, 'id', where);
      const expectedPrefix = kind === 'business' ? 'BR-' : 'ADR-';
      if (!path.basename(file).startsWith(`${id}-`)) {
        throw new Error(`${where}: the id "${id}" does not match the filename.`);
      }
      if (!id.startsWith(expectedPrefix)) {
        throw new Error(`${where}: the id "${id}" must start with "${expectedPrefix}".`);
      }
      requireString(data.status, 'status', where);
      // Normalize before the spread below copies the frontmatter onto the node.
      if (kind === 'technical') {
        data.date = requireDateString(data.date, where);
      }
      nodes.push({
        id,
        kind,
        title: requireString(data.title, 'title', where),
        tab: kind,
        parent: null,
        data: { ...data },
        body: content.trim(),
        drift: [],
      });

      if (kind === 'business') {
        for (const other of asList(data.relates_to, 'relates_to', where)) {
          edges.push(edge(id, other, 'relates_to', 'business'));
        }
        for (const fn of asList(data.implemented_by, 'implemented_by', where)) {
          edges.push(edge(id, fn, 'implemented_by', 'cross'));
        }
      } else {
        for (const br of asList(data.driven_by, 'driven_by', where)) {
          edges.push(edge(id, br, 'driven_by', 'cross'));
        }
        for (const adr of asList(data.supersedes, 'supersedes', where)) {
          edges.push(edge(id, adr, 'supersedes', 'technical'));
        }
      }
    }
  }

  const xsrcDir = path.join(promptsDir, 'xsrc');
  for (const file of await listMarkdown(xsrcDir)) {
    const rel = toPosix(path.relative(xsrcDir, file));
    const where = `xsrc/${rel}`;
    const { data, content } = matter(await readFile(file, 'utf8'));
    const fileId = fileIdFromXsrcPath(rel);
    const nodeId = xsrcIdFromFileId(fileId);
    const declaredId = requireString(data.id, 'id', where);
    if (declaredId !== nodeId) {
      throw new Error(`${where}: the id "${declaredId}" does not match the path "${nodeId}".`);
    }
    requireString(data.mirrors, 'mirrors', where);

    nodes.push({
      id: nodeId,
      kind: 'file',
      title: fileId,
      tab: 'xsrc',
      parent: null,
      data: { ...data },
      body: content.trim(),
      drift: [],
    });

    for (const br of asList(data.implements, 'implements', where)) {
      edges.push(edge(nodeId, br, 'implements', 'cross'));
    }
    for (const adr of asList(data.decisions, 'decisions', where)) {
      edges.push(edge(nodeId, adr, 'decisions', 'cross'));
    }

    const rawFunctions = data.functions;
    if (rawFunctions === undefined) {
      throw new Error(`${where}: the field "functions" is required. Use [] for a type-only file.`);
    }
    if (!Array.isArray(rawFunctions)) {
      throw new Error(`${where}: the field "functions" must be a list.`);
    }
    for (const raw of rawFunctions as Record<string, unknown>[]) {
      const name = requireString(raw.name, 'functions[].name', where);
      const entry: FunctionEntry = {
        name,
        input: requireString(raw.input, `functions[${name}].input`, where),
        output: requireString(raw.output, `functions[${name}].output`, where),
        responsibility: requireString(
          raw.responsibility,
          `functions[${name}].responsibility`,
          where,
        ),
        calls: asList(raw.calls, `functions[${name}].calls`, where),
      };
      const fnId = functionId(fileId, name);
      nodes.push({
        id: fnId,
        kind: 'function',
        title: name,
        tab: 'xsrc',
        parent: nodeId,
        data: { ...entry },
        body: '',
        drift: [],
      });
      for (const target of entry.calls) {
        edges.push(edge(fnId, target, 'calls', 'xsrc'));
      }
    }
  }

  return { nodes, edges };
}
```

- [ ] **Step 11: Run the tests to verify they pass**

Run: `npm --workspace visualize run test`
Expected: PASS, 7 tests.

- [ ] **Step 12: Commit**

```bash
git add visualize/ package-lock.json
git commit -m "feat(visualize): add the graph types and the prompt parser"
```

---

### Task 10: The code parser

**Files:**
- Create: `visualize/scripts/lib/parse-code.ts`
- Test: `visualize/scripts/__tests__/parse-code.test.ts`

**Interfaces:**
- Consumes: `fileIdFromSrcPath`, `functionId`, `isIgnored`, `readIgnoreGlobs` from Task 9.
- Produces:
  - `interface CodeFunction { id: string; fileId: string; name: string; calls: string[] }`
  - `interface CodePass { files: Record<string, CodeFunction[]> }`
  - `parseCode(srcDir: string, ignoreGlobs: string[]): Promise<CodePass>`

A call is recorded when the called identifier resolves to an exported function declaration in another file under `srcDir`, or in the same file. Calls made inside a nested function, such as an arrow function passed to `router.post`, belong to the nearest enclosing **exported** function. A method call on an object, such as `deps.repo.save(...)`, is not a call.

- [ ] **Step 1: Write the failing test**

`visualize/scripts/__tests__/parse-code.test.ts`:

```ts
import { writeFile } from 'node:fs/promises';
import { afterAll, describe, expect, it } from 'vitest';
import { parseCode } from '../lib/parse-code.js';
import { readIgnoreGlobs } from '../lib/paths.js';
import { cleanupRepos, makeRepo } from './helpers.js';

afterAll(cleanupRepos);

async function parseFixture(mutate?: (dir: string) => Promise<void>) {
  const { promptsDir, srcDir } = await makeRepo(mutate);
  return parseCode(srcDir, await readIgnoreGlobs(promptsDir));
}

describe('parseCode', () => {
  it('finds the exported functions of each file', async () => {
    const pass = await parseFixture();
    expect(Object.keys(pass.files).sort()).toEqual(['app', 'greet']);
    expect(pass.files.greet.map((f) => f.name)).toEqual(['greet']);
    expect(pass.files.app.map((f) => f.id)).toEqual(['app#run']);
  });

  it('records a cross-file call', async () => {
    const pass = await parseFixture();
    expect(pass.files.app[0].calls).toEqual(['greet#greet']);
  });

  it('skips a file that the ignore list matches', async () => {
    const pass = await parseFixture();
    expect(pass.files).not.toHaveProperty('index');
  });

  it('ignores a function that the file does not export', async () => {
    const pass = await parseFixture(async (root) => {
      await writeFile(
        `${root}/code/src/app.ts`,
        [
          "import { greet } from './greet.js';",
          '',
          'function shout(text: string): string {',
          '  return text.toUpperCase();',
          '}',
          '',
          'export function run(): string {',
          "  return shout(greet('world'));",
          '}',
          '',
        ].join('\n'),
        'utf8',
      );
    });
    expect(pass.files.app.map((f) => f.name)).toEqual(['run']);
    expect(pass.files.app[0].calls).toEqual(['greet#greet']);
  });

  it('attributes a call inside a nested arrow function to the exported function', async () => {
    const pass = await parseFixture(async (root) => {
      await writeFile(
        `${root}/code/src/app.ts`,
        [
          "import { greet } from './greet.js';",
          '',
          'export function run(): string[] {',
          "  return ['world'].map((name) => greet(name));",
          '}',
          '',
        ].join('\n'),
        'utf8',
      );
    });
    expect(pass.files.app[0].calls).toEqual(['greet#greet']);
  });

  it('does not record a method call on an object', async () => {
    const pass = await parseFixture(async (root) => {
      await writeFile(
        `${root}/code/src/app.ts`,
        [
          'export function run(deps: { save(): void }): void {',
          '  deps.save();',
          '}',
          '',
        ].join('\n'),
        'utf8',
      );
    });
    expect(pass.files.app[0].calls).toEqual([]);
  });

  it('records a call to an exported function in the same file', async () => {
    const pass = await parseFixture(async (root) => {
      await writeFile(
        `${root}/code/src/app.ts`,
        [
          'export function helper(): string {',
          "  return 'x';",
          '}',
          '',
          'export function run(): string {',
          '  return helper();',
          '}',
          '',
        ].join('\n'),
        'utf8',
      );
    });
    const run = pass.files.app.find((f) => f.name === 'run');
    expect(run?.calls).toEqual(['app#helper']);
  });

  it('records an exported arrow-function constant', async () => {
    const pass = await parseFixture(async (root) => {
      await writeFile(
        `${root}/code/src/app.ts`,
        [
          "import { greet } from './greet.js';",
          '',
          'export const run = (): string => greet(\'world\');',
          '',
        ].join('\n'),
        'utf8',
      );
    });
    expect(pass.files.app.map((f) => f.name)).toEqual(['run']);
    expect(pass.files.app[0].calls).toEqual(['greet#greet']);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm --workspace visualize run test parse-code`
Expected: FAIL — cannot resolve `../lib/parse-code.js`.

- [ ] **Step 3: Write `visualize/scripts/lib/parse-code.ts`**

```ts
import path from 'node:path';
import {
  Node,
  Project,
  SyntaxKind,
  type ArrowFunction,
  type FunctionDeclaration,
  type FunctionExpression,
  type SourceFile,
} from 'ts-morph';
import { fileIdFromSrcPath, functionId, isIgnored, toPosix } from './paths.js';

export interface CodeFunction {
  id: string;
  fileId: string;
  name: string;
  calls: string[];
}

export interface CodePass {
  files: Record<string, CodeFunction[]>;
}

type FunctionBody = FunctionDeclaration | ArrowFunction | FunctionExpression;

/** Collect the exported functions of one file, keyed by their declared name. */
function exportedFunctions(source: SourceFile): Map<string, FunctionBody> {
  const found = new Map<string, FunctionBody>();
  for (const [name, declarations] of source.getExportedDeclarations()) {
    for (const declaration of declarations) {
      if (declaration.getSourceFile() !== source) continue;
      if (Node.isFunctionDeclaration(declaration)) {
        found.set(name, declaration);
      } else if (Node.isVariableDeclaration(declaration)) {
        const initializer = declaration.getInitializer();
        if (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer)) {
          found.set(name, initializer);
        }
      }
    }
  }
  return found;
}

export async function parseCode(srcDir: string, ignoreGlobs: string[]): Promise<CodePass> {
  const project = new Project({
    compilerOptions: { allowJs: false, skipLibCheck: true },
    useInMemoryFileSystem: false,
    skipAddingFilesFromTsConfig: true,
  });
  project.addSourceFilesAtPaths(`${toPosix(srcDir)}/**/*.ts`);

  const idOf = (source: SourceFile): string =>
    fileIdFromSrcPath(path.relative(srcDir, source.getFilePath()));

  const included = project
    .getSourceFiles()
    .filter((source) => !isIgnored(path.relative(srcDir, source.getFilePath()), ignoreGlobs));

  // Map every exported function declaration node to its id, so a call can resolve to it.
  const idByDeclaration = new Map<FunctionBody, string>();
  for (const source of included) {
    const fileId = idOf(source);
    for (const [name, declaration] of exportedFunctions(source)) {
      idByDeclaration.set(declaration, functionId(fileId, name));
    }
  }

  const files: Record<string, CodeFunction[]> = {};
  for (const source of included) {
    const fileId = idOf(source);
    const functions: CodeFunction[] = [];

    for (const [name, declaration] of exportedFunctions(source)) {
      const calls = new Set<string>();
      for (const call of declaration.getDescendantsOfKind(SyntaxKind.CallExpression)) {
        const callee = call.getExpression();
        // A property access such as deps.repo.save is a method call, not a graph edge.
        if (!Node.isIdentifier(callee)) continue;
        for (const definition of callee.getDefinitionNodes()) {
          let target: Node | undefined = definition;
          if (Node.isVariableDeclaration(definition)) {
            target = definition.getInitializer();
          }
          const id = target ? idByDeclaration.get(target as FunctionBody) : undefined;
          if (id) calls.add(id);
        }
      }
      functions.push({ id: functionId(fileId, name), fileId, name, calls: [...calls].sort() });
    }

    files[fileId] = functions;
  }

  return { files };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm --workspace visualize run test`
Expected: PASS, 15 tests.

If the nested-arrow test fails, the cause is `getDescendantsOfKind` reaching into the nested function — that is the wanted behavior, and the test asserts it. If the same-file test fails, check that `getExportedDeclarations` returns the declaration in the same source file.

- [ ] **Step 5: Commit**

```bash
git add visualize/
git commit -m "feat(visualize): add the ts-morph code parser"
```

---

### Task 11: The drift diff and the build-graph CLI

**Files:**
- Create: `visualize/scripts/lib/diff.ts`, `visualize/scripts/build-graph.ts`
- Test: `visualize/scripts/__tests__/diff.test.ts`

**Interfaces:**
- Consumes: `PromptPass` from Task 9, `CodePass` from Task 10, the types from Task 9.
- Produces: `buildGraph(prompts: PromptPass, code: CodePass): Graph`, and the CLI `tsx scripts/build-graph.ts [--check] [--repo <dir>] [--out <file>]`.

Diff order matters:
1. Start from the prompt nodes and edges.
2. Synthesize a `file` node with `missing-prompt` drift for each code file that has no mirror.
3. Synthesize a `function` node for each code function that has no prompt entry, and attach `missing-function` drift to its file node.
4. Attach `orphan-prompt` and `orphan-function` for the reverse cases.
5. Compare declared calls against actual calls, attaching `call-drift` to the declared edge or to a synthesized edge.
6. Resolve every remaining edge target against the final node set. Drop an unresolved edge and attach `broken-ref` to its source node.

- [ ] **Step 1: Write the failing test**

`visualize/scripts/__tests__/diff.test.ts`:

```ts
import { rm, writeFile } from 'node:fs/promises';
import { afterAll, describe, expect, it } from 'vitest';
import { buildGraph } from '../lib/diff.js';
import { parseCode } from '../lib/parse-code.js';
import { parsePrompts } from '../lib/parse-prompts.js';
import { readIgnoreGlobs } from '../lib/paths.js';
import { cleanupRepos, makeRepo, patchFile } from './helpers.js';

afterAll(cleanupRepos);

async function graphOf(mutate?: (dir: string) => Promise<void>) {
  const { promptsDir, srcDir } = await makeRepo(mutate);
  const prompts = await parsePrompts(promptsDir);
  const code = await parseCode(srcDir, await readIgnoreGlobs(promptsDir));
  return buildGraph(prompts, code);
}

function driftKinds(graph: Awaited<ReturnType<typeof graphOf>>): string[] {
  return [
    ...graph.nodes.flatMap((n) => n.drift.map((d) => `${n.id}:${d.kind}`)),
    ...graph.edges.flatMap((e) => e.drift.map((d) => `${e.id}:${d.kind}`)),
  ].sort();
}

describe('buildGraph', () => {
  it('reports no drift for the clean fixture', async () => {
    const graph = await graphOf();
    expect(driftKinds(graph)).toEqual([]);
    expect(graph.driftSummary).toEqual({
      'missing-prompt': 0,
      'orphan-prompt': 0,
      'missing-function': 0,
      'orphan-function': 0,
      'call-drift': 0,
      'broken-ref': 0,
    });
  });

  it('reports missing-prompt for a source file with no mirror', async () => {
    const graph = await graphOf(async (root) => {
      await rm(`${root}/prompts/xsrc/greet.md`);
    });
    expect(driftKinds(graph)).toContain('xsrc/greet:missing-prompt');
    expect(graph.driftSummary['missing-prompt']).toBe(1);
    // The synthesized node keeps the call edge resolvable.
    expect(graph.nodes.some((n) => n.id === 'greet#greet')).toBe(true);
  });

  it('reports orphan-prompt for a mirror with no source file', async () => {
    const graph = await graphOf(async (root) => {
      await rm(`${root}/code/src/greet.ts`);
      await writeFile(`${root}/code/src/app.ts`, "export function run(): string {\n  return 'x';\n}\n", 'utf8');
    });
    expect(driftKinds(graph)).toContain('xsrc/greet:orphan-prompt');
    expect(graph.driftSummary['orphan-prompt']).toBe(1);
  });

  it('reports missing-function for a function the prompt omits', async () => {
    const graph = await graphOf(async (root) => {
      await patchFile(
        `${root}/code/src/greet.ts`,
        'export function greet',
        "export function shout(t: string): string {\n  return t.toUpperCase();\n}\n\nexport function greet",
      );
    });
    expect(driftKinds(graph)).toContain('xsrc/greet:missing-function');
    expect(graph.nodes.some((n) => n.id === 'greet#shout')).toBe(true);
  });

  it('reports orphan-function for a function the code does not have', async () => {
    const graph = await graphOf(async (root) => {
      await patchFile(
        `${root}/prompts/xsrc/greet.md`,
        '    calls: []\n',
        '    calls: []\n  - name: shout\n    input: "Accept a text."\n    output: "Return the text in capitals."\n    responsibility: "Raise the text to capitals."\n    calls: []\n',
      );
    });
    expect(driftKinds(graph)).toContain('greet#shout:orphan-function');
  });

  it('reports call-drift for a declared call that the code does not make', async () => {
    const graph = await graphOf(async (root) => {
      await writeFile(`${root}/code/src/app.ts`, "export function run(): string {\n  return 'x';\n}\n", 'utf8');
    });
    expect(driftKinds(graph)).toContain('app#run->greet#greet:calls:call-drift');
  });

  it('reports call-drift for a call the prompt does not declare', async () => {
    const graph = await graphOf(async (root) => {
      await patchFile(`${root}/prompts/xsrc/app.md`, 'calls: [greet#greet]', 'calls: []');
    });
    expect(driftKinds(graph)).toContain('app#run->greet#greet:calls:call-drift');
    expect(graph.edges.find((e) => e.id === 'app#run->greet#greet:calls')).toBeDefined();
  });

  it('reports broken-ref for a reference to an unknown id', async () => {
    const graph = await graphOf(async (root) => {
      await patchFile(`${root}/prompts/xsrc/app.md`, 'implements: [BR-0001]', 'implements: [BR-0099]');
    });
    expect(driftKinds(graph)).toContain('xsrc/app:broken-ref');
    expect(graph.edges.some((e) => e.target === 'BR-0099')).toBe(false);
  });

  it('stamps the build time', async () => {
    const graph = await graphOf();
    expect(() => new Date(graph.generatedAt).toISOString()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm --workspace visualize run test diff`
Expected: FAIL — cannot resolve `../lib/diff.js`.

- [ ] **Step 3: Write `visualize/scripts/lib/diff.ts`**

```ts
import {
  DRIFT_KINDS,
  type Drift,
  type DriftKind,
  type Graph,
  type GraphEdge,
  type GraphNode,
} from '../../src/graph/types.js';
import type { CodePass } from './parse-code.js';
import type { PromptPass } from './parse-prompts.js';
import { fileIdFromXsrcId, functionId, xsrcIdFromFileId } from './paths.js';

function drift(kind: DriftKind, id: string, message: string): Drift {
  return { kind, id, message };
}

export function buildGraph(prompts: PromptPass, code: CodePass): Graph {
  const nodes: GraphNode[] = prompts.nodes.map((n) => ({ ...n, drift: [...n.drift] }));
  const edges: GraphEdge[] = prompts.edges.map((e) => ({ ...e, drift: [...e.drift] }));
  const byId = new Map(nodes.map((n) => [n.id, n]));

  const promptFileIds = new Set(
    nodes.filter((n) => n.kind === 'file').map((n) => fileIdFromXsrcId(n.id)),
  );
  const codeFileIds = new Set(Object.keys(code.files));

  // 2. A source file with no mirror.
  for (const fileId of codeFileIds) {
    if (promptFileIds.has(fileId)) continue;
    const node: GraphNode = {
      id: xsrcIdFromFileId(fileId),
      kind: 'file',
      title: fileId,
      tab: 'xsrc',
      parent: null,
      data: { mirrors: `code/src/${fileId}.ts` },
      body: '',
      drift: [
        drift('missing-prompt', xsrcIdFromFileId(fileId), `Write a mirror prompt for code/src/${fileId}.ts.`),
      ],
    };
    nodes.push(node);
    byId.set(node.id, node);
  }

  // 3 and 4. Compare the function sets of each file.
  for (const fileId of new Set([...promptFileIds, ...codeFileIds])) {
    const fileNodeId = xsrcIdFromFileId(fileId);
    const fileNode = byId.get(fileNodeId);
    const codeFunctions = code.files[fileId];

    if (!codeFunctions) {
      fileNode?.drift.push(
        drift('orphan-prompt', fileNodeId, `Find no source file for ${fileNodeId}. Delete the prompt or write the file.`),
      );
      continue;
    }

    const declared = new Set(
      nodes.filter((n) => n.kind === 'function' && n.parent === fileNodeId).map((n) => n.title),
    );

    for (const fn of codeFunctions) {
      if (declared.has(fn.name)) continue;
      fileNode?.drift.push(
        drift('missing-function', fn.id, `Describe the exported function ${fn.name} in ${fileNodeId}.`),
      );
      const node: GraphNode = {
        id: fn.id,
        kind: 'function',
        title: fn.name,
        tab: 'xsrc',
        parent: fileNodeId,
        data: {},
        body: '',
        drift: [],
      };
      nodes.push(node);
      byId.set(node.id, node);
    }

    const actualNames = new Set(codeFunctions.map((fn) => fn.name));
    for (const name of declared) {
      if (actualNames.has(name)) continue;
      byId
        .get(functionId(fileId, name))
        ?.drift.push(
          drift('orphan-function', functionId(fileId, name), `Find no exported function ${name} in code/src/${fileId}.ts.`),
        );
    }
  }

  // 5. Compare the call edges.
  const declaredCalls = new Map(
    edges.filter((e) => e.kind === 'calls').map((e) => [`${e.source}->${e.target}`, e]),
  );
  const actualCalls = new Set<string>();
  for (const functions of Object.values(code.files)) {
    for (const fn of functions) {
      for (const target of fn.calls) actualCalls.add(`${fn.id}->${target}`);
    }
  }

  for (const [key, e] of declaredCalls) {
    if (actualCalls.has(key)) continue;
    // A call declared against a file that has no code at all is already orphan-prompt.
    if (!code.files[e.source.split('#')[0]]) continue;
    e.drift.push(drift('call-drift', e.id, `The prompt declares the call ${key}, but the code does not make it.`));
  }

  for (const key of actualCalls) {
    if (declaredCalls.has(key)) continue;
    const [source, target] = key.split('->');
    const e: GraphEdge = {
      id: `${source}->${target}:calls`,
      source,
      target,
      kind: 'calls',
      tab: 'xsrc',
      drift: [drift('call-drift', `${source}->${target}:calls`, `The code makes the call ${key}, but no prompt declares it.`)],
    };
    edges.push(e);
  }

  // 6. Resolve every edge target. Drop what does not resolve.
  const resolved: GraphEdge[] = [];
  for (const e of edges) {
    if (byId.has(e.target) && byId.has(e.source)) {
      resolved.push(e);
      continue;
    }
    const missing = byId.has(e.target) ? e.source : e.target;
    byId
      .get(e.source)
      ?.drift.push(drift('broken-ref', e.source, `The reference "${missing}" matches no node.`));
  }

  const driftSummary = Object.fromEntries(DRIFT_KINDS.map((k) => [k, 0])) as Record<DriftKind, number>;
  for (const item of [...nodes, ...resolved]) {
    for (const d of item.drift) driftSummary[d.kind] += 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    nodes,
    edges: resolved,
    driftSummary,
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm --workspace visualize run test`
Expected: PASS, 24 tests.

- [ ] **Step 5: Write `visualize/scripts/build-graph.ts`**

```ts
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGraph } from './lib/diff.js';
import { parseCode } from './lib/parse-code.js';
import { parsePrompts } from './lib/parse-prompts.js';
import { readIgnoreGlobs } from './lib/paths.js';

interface Options {
  repo: string;
  out: string;
  check: boolean;
}

function parseArgs(argv: string[], defaults: Options): Options {
  const options = { ...defaults };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--check') options.check = true;
    else if (argv[i] === '--repo') options.repo = path.resolve(String(argv[++i]));
    else if (argv[i] === '--out') options.out = path.resolve(String(argv[++i]));
  }
  return options;
}

async function run(): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(here, '..', '..');
  const options = parseArgs(process.argv.slice(2), {
    repo: repoRoot,
    out: path.join(repoRoot, 'visualize', 'src', 'generated', 'graph.json'),
    check: false,
  });

  const promptsDir = path.join(options.repo, 'prompts');
  const srcDir = path.join(options.repo, 'code', 'src');

  const prompts = await parsePrompts(promptsDir);
  const code = await parseCode(srcDir, await readIgnoreGlobs(promptsDir));
  const graph = buildGraph(prompts, code);

  await mkdir(path.dirname(options.out), { recursive: true });
  await writeFile(options.out, `${JSON.stringify(graph, null, 2)}\n`, 'utf8');

  const total = Object.values(graph.driftSummary).reduce((sum, n) => sum + n, 0);
  console.log(
    `Wrote ${path.relative(options.repo, options.out)}: ` +
      `${graph.nodes.length} nodes, ${graph.edges.length} edges, ${total} drift.`,
  );

  if (total > 0) {
    for (const node of graph.nodes) {
      for (const d of node.drift) console.log(`  ${d.kind}  ${d.id}  ${d.message}`);
    }
    for (const edge of graph.edges) {
      for (const d of edge.drift) console.log(`  ${d.kind}  ${d.id}  ${d.message}`);
    }
  }

  if (options.check && total > 0) {
    console.error(`check:drift failed. Fix ${total} drift item(s).`);
    process.exitCode = 1;
  }
}

await run();
```

- [ ] **Step 6: Run the builder against the real repository**

Run: `npm run graph`
Expected: a line reporting the node count, the edge count, and `0 drift`. If it reports drift, fix the prompts from Task 8 or the code from Tasks 2 through 5 until it reports zero. Do not change the checker to make the number smaller.

- [ ] **Step 7: Verify the check mode**

Run: `npm run check:drift; echo "exit=$?"`
Expected: `exit=0`.

Then run: `npm run check:drift -- --repo .` after temporarily deleting `prompts/xsrc/main.md`, confirm a non-zero exit and a `missing-prompt` line, then restore the file with `git checkout prompts/xsrc/main.md`.

- [ ] **Step 8: Commit**

```bash
git add visualize/
git commit -m "feat(visualize): diff prompts against code and emit graph.json"
```

---

### Task 12: The canvas

**Files:**
- Create: `visualize/src/mount.tsx`, `visualize/src/App.tsx`, `visualize/src/layout.ts`, `visualize/src/graph/load.ts`, `visualize/src/styles.css`
- Create: `visualize/src/components/TabBar.tsx`, `visualize/src/components/Canvas.tsx`

**Interfaces:**
- Consumes: `Graph`, `GraphNode`, `GraphEdge`, `TabName` from Task 9; `graph.json` from Task 11.
- Produces:
  - `loadGraph(): Graph`
  - `selectForTab(graph: Graph, tab: TabName, showCross: boolean): { nodes: GraphNode[]; edges: GraphEdge[] }`
  - `layout(nodes, edges): Array<GraphNode & { x: number; y: number }>`
  - `<TabBar tab onTabChange showCross onShowCrossChange />`
  - `<Canvas nodes edges selectedId onSelect />`

- [ ] **Step 1: Write `visualize/src/graph/load.ts`**

```ts
import raw from './../generated/graph.json';
import type { Graph, GraphEdge, GraphNode, TabName } from './types.js';

export function loadGraph(): Graph {
  return raw as Graph;
}

/**
 * Pick the nodes and edges for one tab.
 * With showCross off, keep only the nodes whose own tab matches.
 * With showCross on, add every node that a cross edge from this tab reaches.
 */
export function selectForTab(
  graph: Graph,
  tab: TabName,
  showCross: boolean,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const own = new Set(graph.nodes.filter((n) => n.tab === tab).map((n) => n.id));

  if (!showCross) {
    const nodes = graph.nodes.filter((n) => own.has(n.id));
    const edges = graph.edges.filter((e) => own.has(e.source) && own.has(e.target));
    return { nodes, edges };
  }

  const reached = new Set(own);
  for (const e of graph.edges) {
    if (own.has(e.source)) reached.add(e.target);
    if (own.has(e.target)) reached.add(e.source);
  }
  const nodes = graph.nodes.filter((n) => reached.has(n.id));
  const edges = graph.edges.filter((e) => reached.has(e.source) && reached.has(e.target));
  return { nodes, edges };
}
```

- [ ] **Step 2: Write `visualize/src/layout.ts`**

```ts
import dagre from '@dagrejs/dagre';
import type { GraphEdge, GraphNode } from './graph/types.js';

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 64;

export interface PositionedNode extends GraphNode {
  x: number;
  y: number;
}

export function layout(nodes: GraphNode[], edges: GraphEdge[]): PositionedNode[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 90 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  const ids = new Set(nodes.map((n) => n.id));
  for (const edge of edges) {
    if (ids.has(edge.source) && ids.has(edge.target)) g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const placed = g.node(node.id);
    return {
      ...node,
      x: (placed?.x ?? 0) - NODE_WIDTH / 2,
      y: (placed?.y ?? 0) - NODE_HEIGHT / 2,
    };
  });
}
```

- [ ] **Step 3: Write `visualize/src/components/TabBar.tsx`**

```tsx
import type { TabName } from '../graph/types.js';

const TABS: TabName[] = ['business', 'technical', 'xsrc'];

interface Props {
  tab: TabName;
  onTabChange: (tab: TabName) => void;
  showCross: boolean;
  onShowCrossChange: (value: boolean) => void;
}

export function TabBar({ tab, onTabChange, showCross, onShowCrossChange }: Props) {
  return (
    <nav className="tabbar">
      <div role="tablist" aria-label="Prompt kinds">
        {TABS.map((name) => (
          <button
            key={name}
            role="tab"
            aria-selected={name === tab}
            className={name === tab ? 'tab tab--active' : 'tab'}
            onClick={() => onTabChange(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <label className="cross-toggle">
        <input
          type="checkbox"
          checked={showCross}
          onChange={(event) => onShowCrossChange(event.target.checked)}
        />
        show implementations
      </label>
    </nav>
  );
}
```

- [ ] **Step 4: Write `visualize/src/components/Canvas.tsx`**

```tsx
import { Background, Controls, ReactFlow, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo } from 'react';
import type { GraphEdge, GraphNode } from '../graph/types.js';
import { layout } from '../layout.js';

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function Canvas({ nodes, edges, selectedId, onSelect }: Props) {
  const flowNodes: Node[] = useMemo(
    () =>
      layout(nodes, edges).map((node) => ({
        id: node.id,
        position: { x: node.x, y: node.y },
        data: { label: `${node.title}${node.drift.length > 0 ? '  ⚠' : ''}` },
        className: [
          `node node--${node.kind}`,
          node.drift.length > 0 ? 'node--drift' : '',
          node.id === selectedId ? 'node--selected' : '',
        ]
          .filter(Boolean)
          .join(' '),
      })),
    [nodes, edges, selectedId],
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.kind,
        animated: edge.kind === 'calls',
        className: edge.drift.length > 0 ? 'edge edge--drift' : 'edge',
      })),
    [edges],
  );

  return (
    <div className="canvas" data-testid="canvas">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodeClick={(_event, node) => onSelect(node.id)}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
```

- [ ] **Step 5: Write `visualize/src/App.tsx` and `visualize/src/mount.tsx`**

`App.tsx` (the side panel and the banner arrive in Task 13):

```tsx
import { useMemo, useState } from 'react';
import { Canvas } from './components/Canvas.js';
import { TabBar } from './components/TabBar.js';
import { loadGraph, selectForTab } from './graph/load.js';
import type { Graph, TabName } from './graph/types.js';

export function App({ graph = loadGraph() }: { graph?: Graph }) {
  const [tab, setTab] = useState<TabName>('business');
  const [showCross, setShowCross] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const view = useMemo(() => selectForTab(graph, tab, showCross), [graph, tab, showCross]);

  return (
    <div className="app">
      <TabBar
        tab={tab}
        onTabChange={setTab}
        showCross={showCross}
        onShowCrossChange={setShowCross}
      />
      <Canvas
        nodes={view.nodes}
        edges={view.edges}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </div>
  );
}
```

`mount.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('Find no #root element in index.html.');
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 6: Write `visualize/src/styles.css`**

```css
:root {
  --bg: #0f1117;
  --panel: #171a23;
  --line: #2a2f3d;
  --text: #e6e8ee;
  --muted: #98a0b3;
  --accent: #6ea8fe;
  --warn: #f0a04b;
  --warn-bg: #3a2a17;
}

* { box-sizing: border-box; }

body { margin: 0; background: var(--bg); color: var(--text);
  font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, sans-serif; }

.app { display: flex; flex-direction: column; height: 100vh; }

.tabbar { display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 10px 16px; border-bottom: 1px solid var(--line); background: var(--panel); }

.tab { background: none; border: 1px solid transparent; color: var(--muted);
  padding: 6px 14px; border-radius: 999px; cursor: pointer; font: inherit; }
.tab--active { color: var(--text); border-color: var(--accent); background: #1d2333; }

.cross-toggle { display: flex; align-items: center; gap: 8px; color: var(--muted); }

.canvas { flex: 1; min-height: 0; }

.node { border-radius: 8px; border: 1px solid var(--line); background: var(--panel);
  color: var(--text); padding: 8px 12px; font-size: 12px; }
.node--business { border-left: 4px solid #7bd88f; }
.node--technical { border-left: 4px solid var(--accent); }
.node--file { border-left: 4px solid #b48ead; }
.node--function { border-left: 4px solid #e5c07b; }
.node--drift { border-color: var(--warn); background: var(--warn-bg); }
.node--selected { outline: 2px solid var(--accent); }

.edge--drift { stroke: var(--warn); }
```

- [ ] **Step 7: Build the graph, then build the app**

Run: `npm run graph && npm --workspace visualize run build`
Expected: both succeed. The `graph` step must run first, because `graph.json` is git-ignored.

- [ ] **Step 8: Look at the canvas**

Run: `npm run dev:viz`
Open `http://localhost:5173`. Confirm three tabs, a pan-and-zoom canvas, and that the xsrc tab shows function nodes joined by `calls` edges. Stop the server.

- [ ] **Step 9: Commit**

```bash
git add visualize/
git commit -m "feat(visualize): render the prompt graph on a tabbed canvas"
```

---

### Task 13: The side panel, the drift banner, and the render tests

**Files:**
- Create: `visualize/src/components/SidePanel.tsx`, `visualize/src/components/DriftBanner.tsx`
- Modify: `visualize/src/App.tsx`, `visualize/src/styles.css`
- Test: `visualize/src/App.test.tsx`

**Interfaces:**
- Consumes: `Graph`, `GraphNode`, `GraphEdge` from Task 9; `selectForTab` from Task 12.
- Produces:
  - `relatedOf(graph: Graph, id: string): GraphEdge[]`
  - `<SidePanel graph node onJump onClose />`
  - `<DriftBanner summary driftOnly onDriftOnlyChange />`

- [ ] **Step 1: Write the failing test**

`visualize/src/App.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App.js';
import type { Graph } from './graph/types.js';

const graph: Graph = {
  generatedAt: '2026-08-21T00:00:00.000Z',
  nodes: [
    { id: 'BR-0001', kind: 'business', title: 'Greeting', tab: 'business', parent: null,
      data: { status: 'active' }, body: 'Greet the user by name.', drift: [] },
    { id: 'ADR-0001', kind: 'technical', title: 'Use TypeScript', tab: 'technical', parent: null,
      data: { status: 'accepted' }, body: 'Write the fixture in TypeScript.', drift: [] },
    { id: 'xsrc/greet', kind: 'file', title: 'greet', tab: 'xsrc', parent: null,
      data: { mirrors: 'code/src/greet.ts' }, body: '', drift: [] },
    { id: 'greet#greet', kind: 'function', title: 'greet', tab: 'xsrc', parent: 'xsrc/greet',
      data: { input: 'Accept a name string.' }, body: '',
      drift: [{ kind: 'orphan-function', id: 'greet#greet', message: 'Find no exported function greet.' }] },
  ],
  edges: [
    { id: 'BR-0001->greet#greet:implemented_by', source: 'BR-0001', target: 'greet#greet',
      kind: 'implemented_by', tab: 'cross', drift: [] },
  ],
  driftSummary: { 'missing-prompt': 0, 'orphan-prompt': 0, 'missing-function': 0,
    'orphan-function': 1, 'call-drift': 0, 'broken-ref': 0 },
};

describe('App', () => {
  it('opens on the business tab', () => {
    render(<App graph={graph} />);
    expect(screen.getByRole('tab', { name: 'business' })).toHaveAttribute('aria-selected', 'true');
  });

  it('switches to the technical tab', async () => {
    render(<App graph={graph} />);
    await userEvent.click(screen.getByRole('tab', { name: 'technical' }));
    expect(screen.getByRole('tab', { name: 'technical' })).toHaveAttribute('aria-selected', 'true');
  });

  it('shows the drift counts in the banner', () => {
    render(<App graph={graph} />);
    const banner = screen.getByTestId('drift-banner');
    // Assert on the banner's whole text: "1" appears in both the total and the chip,
    // so getByText(/1/) would match two elements and throw.
    expect(banner).toHaveTextContent('orphan-function');
    expect(banner).toHaveTextContent('1 drift');
  });

  it('opens the side panel with the prompt body when a node is selected', async () => {
    render(<App graph={graph} />);
    await userEvent.click(screen.getByText('Greeting'));
    const panel = screen.getByTestId('side-panel');
    expect(within(panel).getByText('Greet the user by name.')).toBeInTheDocument();
  });

  it('jumps to a related node in another tab', async () => {
    render(<App graph={graph} />);
    await userEvent.click(screen.getByText('Greeting'));
    await userEvent.click(screen.getByRole('button', { name: /greet#greet/ }));
    expect(screen.getByRole('tab', { name: 'xsrc' })).toHaveAttribute('aria-selected', 'true');
    const panel = screen.getByTestId('side-panel');
    expect(within(panel).getByText(/orphan-function/)).toBeInTheDocument();
  });

  it('closes the side panel', async () => {
    render(<App graph={graph} />);
    await userEvent.click(screen.getByText('Greeting'));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByTestId('side-panel')).not.toBeInTheDocument();
  });
});
```

Add `@testing-library/user-event` to `visualize` devDependencies:

```bash
npm --workspace visualize install --save-dev @testing-library/user-event@^14.5.2
```

React Flow does not render node labels in jsdom without a sized container. Mock it for the test by adding this to `visualize/src/test-setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// React Flow measures the DOM, which jsdom does not do. Render a plain list instead.
vi.mock('./components/Canvas.js', () => ({
  Canvas: ({
    nodes,
    onSelect,
  }: {
    nodes: { id: string; title: string }[];
    onSelect: (id: string) => void;
  }) => (
    <div data-testid="canvas">
      {nodes.map((n) => (
        <button key={n.id} onClick={() => onSelect(n.id)}>
          {n.title}
        </button>
      ))}
    </div>
  ),
}));
```

Rename `test-setup.ts` to `test-setup.tsx` and update `vitest.config.ts` to point at it.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm --workspace visualize run test App`
Expected: FAIL — no `drift-banner` and no `side-panel`.

- [ ] **Step 3: Write `visualize/src/components/DriftBanner.tsx`**

```tsx
import { DRIFT_KINDS, type DriftKind } from '../graph/types.js';

interface Props {
  summary: Record<DriftKind, number>;
  driftOnly: boolean;
  onDriftOnlyChange: (value: boolean) => void;
}

export function DriftBanner({ summary, driftOnly, onDriftOnlyChange }: Props) {
  const total = DRIFT_KINDS.reduce((sum, kind) => sum + summary[kind], 0);
  return (
    <div className={total > 0 ? 'banner banner--warn' : 'banner'} data-testid="drift-banner">
      {total === 0 ? (
        <span>The prompts and the code agree.</span>
      ) : (
        <>
          <span>
            <strong>{total}</strong> drift
          </span>
          {DRIFT_KINDS.filter((kind) => summary[kind] > 0).map((kind) => (
            <span key={kind} className="banner__chip">
              {kind} <strong>{summary[kind]}</strong>
            </span>
          ))}
          <button onClick={() => onDriftOnlyChange(!driftOnly)}>
            {driftOnly ? 'show everything' : 'show drift only'}
          </button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Write `visualize/src/components/SidePanel.tsx`**

```tsx
import type { Graph, GraphNode } from '../graph/types.js';

export function relatedOf(graph: Graph, id: string) {
  return graph.edges.filter((edge) => edge.source === id || edge.target === id);
}

interface Props {
  graph: Graph;
  node: GraphNode;
  onJump: (id: string) => void;
  onClose: () => void;
}

export function SidePanel({ graph, node, onJump, onClose }: Props) {
  const related = relatedOf(graph, node.id);
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));

  return (
    <aside className="panel" data-testid="side-panel">
      <header className="panel__head">
        <div>
          <div className="panel__kind">{node.kind}</div>
          <h2>{node.title}</h2>
          <code>{node.id}</code>
        </div>
        <button onClick={onClose}>Close</button>
      </header>

      {node.drift.length > 0 && (
        <ul className="panel__drift">
          {node.drift.map((d) => (
            <li key={`${d.kind}:${d.id}`}>
              <strong>{d.kind}</strong> {d.message}
            </li>
          ))}
        </ul>
      )}

      {node.body && <div className="panel__body">{node.body}</div>}

      <dl className="panel__fields">
        {Object.entries(node.data)
          .filter(([key]) => key !== 'functions' && key !== 'id' && key !== 'type')
          .map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{Array.isArray(value) ? value.join(', ') : String(value)}</dd>
            </div>
          ))}
      </dl>

      {related.length > 0 && (
        <section className="panel__related">
          <h3>Related</h3>
          <ul>
            {related.map((edge) => {
              const otherId = edge.source === node.id ? edge.target : edge.source;
              const other = byId.get(otherId);
              return (
                <li key={edge.id}>
                  <span className="panel__edgekind">{edge.kind}</span>
                  <button onClick={() => onJump(otherId)}>
                    {other ? `${other.title} · ${otherId}` : otherId}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </aside>
  );
}
```

- [ ] **Step 5: Rewrite `visualize/src/App.tsx`**

```tsx
import { useMemo, useState } from 'react';
import { Canvas } from './components/Canvas.js';
import { DriftBanner } from './components/DriftBanner.js';
import { SidePanel } from './components/SidePanel.js';
import { TabBar } from './components/TabBar.js';
import { loadGraph, selectForTab } from './graph/load.js';
import type { Graph, TabName } from './graph/types.js';

export function App({ graph = loadGraph() }: { graph?: Graph }) {
  const [tab, setTab] = useState<TabName>('business');
  const [showCross, setShowCross] = useState(false);
  const [driftOnly, setDriftOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const view = useMemo(() => {
    const picked = selectForTab(graph, tab, showCross);
    if (!driftOnly) return picked;
    const nodes = picked.nodes.filter((n) => n.drift.length > 0);
    const ids = new Set(nodes.map((n) => n.id));
    return { nodes, edges: picked.edges.filter((e) => ids.has(e.source) && ids.has(e.target)) };
  }, [graph, tab, showCross, driftOnly]);

  const selected = graph.nodes.find((n) => n.id === selectedId) ?? null;

  function jump(id: string): void {
    const target = graph.nodes.find((n) => n.id === id);
    if (!target) return;
    setTab(target.tab);
    setDriftOnly(false);
    setSelectedId(id);
  }

  return (
    <div className="app">
      <TabBar
        tab={tab}
        onTabChange={setTab}
        showCross={showCross}
        onShowCrossChange={setShowCross}
      />
      <DriftBanner
        summary={graph.driftSummary}
        driftOnly={driftOnly}
        onDriftOnlyChange={setDriftOnly}
      />
      <div className="app__body">
        <Canvas
          nodes={view.nodes}
          edges={view.edges}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        {selected && (
          <SidePanel
            graph={graph}
            node={selected}
            onJump={jump}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Append the new styles to `visualize/src/styles.css`**

```css
.app__body { flex: 1; min-height: 0; display: flex; }

.banner { display: flex; align-items: center; gap: 12px; padding: 8px 16px;
  border-bottom: 1px solid var(--line); color: var(--muted); font-size: 13px; }
.banner--warn { color: var(--warn); background: var(--warn-bg); }
.banner__chip { border: 1px solid currentColor; border-radius: 999px; padding: 1px 8px; }
.banner button { background: none; border: 1px solid currentColor; color: inherit;
  border-radius: 999px; padding: 2px 10px; cursor: pointer; font: inherit; }

.panel { width: 360px; flex: none; overflow-y: auto; padding: 16px;
  border-left: 1px solid var(--line); background: var(--panel); }
.panel__head { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
.panel__head h2 { margin: 4px 0; font-size: 16px; }
.panel__head button { background: none; border: 1px solid var(--line); color: var(--muted);
  border-radius: 6px; padding: 4px 10px; cursor: pointer; font: inherit; }
.panel__kind { text-transform: uppercase; letter-spacing: .08em; font-size: 11px; color: var(--muted); }
.panel code { color: var(--muted); font-size: 12px; }
.panel__drift { margin: 12px 0; padding: 10px 12px 10px 28px; border-radius: 8px;
  background: var(--warn-bg); color: var(--warn); }
.panel__body { white-space: pre-wrap; margin: 12px 0; }
.panel__fields { display: grid; gap: 6px; margin: 12px 0; }
.panel__fields dt { color: var(--muted); font-size: 12px; }
.panel__fields dd { margin: 0; }
.panel__related h3 { font-size: 13px; color: var(--muted); }
.panel__related ul { list-style: none; padding: 0; display: grid; gap: 6px; }
.panel__related li { display: flex; gap: 8px; align-items: baseline; }
.panel__edgekind { color: var(--muted); font-size: 11px; min-width: 96px; }
.panel__related button { background: none; border: none; color: var(--accent);
  cursor: pointer; text-align: left; font: inherit; padding: 0; }
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm --workspace visualize run test`
Expected: PASS, 30 tests.

- [ ] **Step 8: Look at the canvas**

Run: `npm run dev:viz`
Confirm the banner reads "The prompts and the code agree", that selecting a business rule opens the panel, and that a jump-link switches to the xsrc tab. Stop the server.

- [ ] **Step 9: Commit**

```bash
git add visualize/ package-lock.json
git commit -m "feat(visualize): add the side panel, jump-links, and the drift banner"
```

---

### Task 14: The `/add-feature` skill

**Files:**
- Create: `.claude/skills/add-feature/SKILL.md`

**Interfaces:**
- Consumes: the schemas in `STRUCTURE.md`, the commands in the root `package.json`.
- Produces: the `/add-feature` workflow.

- [ ] **Step 1: Write `.claude/skills/add-feature/SKILL.md`**

````markdown
---
name: add-feature
description: Use when adding a feature, a business rule, or a use case to BubbleCode - interviews for the business rule and the technical decisions, then writes the prompts, the tests, and the code in that order.
---

# Add a feature to BubbleCode

BubbleCode is prompt-first. Write the intent, then write the code. Never the reverse.

## Before you start

1. Read `docs/rules.md`. Write every prompt in Simplified Technical English.
2. Read `STRUCTURE.md`. Follow the frontmatter schemas exactly.
3. Run `npm run check:drift`. A repository that already drifts must be clean before you add
   to it. Report the drift and stop if you cannot clean it.
4. List `prompts/business/` and `prompts/technical/` to find the next free number.

## Step 1 — Interview for the business rule

Ask one question per message. Do not batch them.

1. Who acts, and what do they want to happen?
2. What triggers the rule?
3. What is the outcome when everything is valid?
4. What must the system refuse, and what does it say when it refuses?
5. What must stay true afterwards that a test can check?

Then write `prompts/business/BR-####-<slug>.md` with the schema from `STRUCTURE.md`. Leave
`implemented_by` empty for now; you fill it in at step 4.

**Show the file to the user. Wait for approval. Do not continue without it.**

## Step 2 — Interview for the technical decisions

Read every file in `prompts/technical/`. Decide which existing decisions already cover this
feature.

Ask the user only about what the existing decisions do not settle. Typical questions:

- Does this need a new endpoint, or does it extend one?
- Where does the rule belong: the route boundary, the domain, or the repository?
- Does the repository port need a new method?
- What HTTP status does each failure return?

Write a new ADR **only when the feature makes a decision that no existing ADR covers**. A
new ADR needs a real alternative that you rejected. When no new decision exists, cite the
existing ADRs in the xsrc prompts and say so.

**Show the new ADR, or say that no new ADR is needed. Wait for approval.**

## Step 3 — Propose the implementation plan

Write a short plan in chat, not in a file:

- Every file in `code/src/` to create or to change.
- Every exported function, with its signature.
- Every new call edge, in the form `<file id>#<function> -> <file id>#<function>`.
- Every test file to create or to change.

**Wait for approval.**

## Step 4 — Write the prompts

For each affected file, create or update `prompts/xsrc/<file id>.md`:

- Add a `functions` entry for every new exported function, with `name`, `input`, `output`,
  `responsibility`, and `calls`.
- Add the business rule ids to `implements` and the decision ids to `decisions`.
- Declare a `calls` entry only for a call to an exported function in `code/src`. A method
  call on an injected object is not a call edge.

Then add the function ids to `implemented_by` in the business rule you wrote at step 1.

## Step 5 — Write the tests, then the code

Follow test-driven development.

1. Write the failing test in `code/test/`, mirroring the source path.
2. Run `npm --workspace code run test`. Confirm that it fails for the right reason.
3. Write the smallest code that passes.
4. Run the tests again. Confirm that they pass.

Write one test per acceptance criterion in the business rule.

## Step 6 — Verify

Run all of these and paste the real output:

```bash
npm run check:drift
npm --workspace code run typecheck
npm test
```

`check:drift` must report `0 drift`. If it reports drift, fix the prompt or the code. Never
change the checker to make the number smaller.

## Step 7 — Commit

```bash
git add prompts/ code/
git commit -m "feat: <the business rule title>"
```

## Rules that do not bend

- Write the prompt before the code.
- Stop at every approval gate.
- Report the real command output. Never claim that a check passed without pasting it.
- One business rule per feature. Two rules mean two runs of this skill.
````

- [ ] **Step 2: Verify the skill loads**

Run: `ls .claude/skills/add-feature/SKILL.md && head -5 .claude/skills/add-feature/SKILL.md`
Expected: the frontmatter with `name: add-feature`.

- [ ] **Step 3: Commit**

```bash
git add .claude/
git commit -m "feat: add the /add-feature skill"
```

---

### Task 15: Full-repository verification

**Files:**
- Modify: `STRUCTURE.md` (only if a command in it turns out to be wrong)

**Interfaces:**
- Consumes: everything.
- Produces: evidence that the whole chain works.

- [ ] **Step 1: Install from a clean state**

```bash
rm -rf node_modules code/node_modules visualize/node_modules
npm install
```
Expected: success.

- [ ] **Step 2: Run every test**

Run: `npm test`
Expected: the `code` suite passes 31 tests, the `visualize` suite passes 30 tests.

- [ ] **Step 3: Run the typechecks**

```bash
npm --workspace code run typecheck
npm --workspace visualize run typecheck
```
Expected: no output, exit 0 for both.

- [ ] **Step 4: Confirm zero drift**

Run: `npm run check:drift; echo "exit=$?"`
Expected: a line ending `0 drift.` and `exit=0`.

- [ ] **Step 5: Prove the drift checker catches a real break**

```bash
sed -i 's/name: sortNewestFirst/name: sortNewestFirstXX/' prompts/xsrc/domain/bubble.rules.md
npm run check:drift; echo "exit=$?"
git checkout prompts/xsrc/domain/bubble.rules.md
```
Expected: an `orphan-function` line, a `missing-function` line, and `exit=1`. Then a clean
`git status` after the checkout.

- [ ] **Step 6: Build the canvas**

Run: `npm run graph && npm --workspace visualize run build`
Expected: both succeed.

- [ ] **Step 7: Confirm the graph has the shape the spec promises**

```bash
node --input-type=module -e "
import { readFileSync } from 'node:fs';
const g = JSON.parse(readFileSync('./visualize/src/generated/graph.json', 'utf8'));
console.log('nodes', g.nodes.length, 'edges', g.edges.length);
console.log('tabs', [...new Set(g.nodes.map(n => n.tab))].sort().join(','));
console.log('calls', g.edges.filter(e => e.kind === 'calls').length);
console.log('drift', JSON.stringify(g.driftSummary));"
```
Expected: all three tabs present, at least ten `calls` edges, and every drift count zero.

- [ ] **Step 8: Confirm the working tree is clean**

Run: `git status --porcelain`
Expected: no output.

- [ ] **Step 9: Commit any correction**

```bash
git add -A
git commit -m "chore: verify the full BubbleCode chain end to end"
```

Skip this step when nothing changed.

---

## Self-Review

**Spec coverage**

| Spec section | Task |
| --- | --- |
| 2 Repository layout | 1, 2, 9 |
| 3 Identifier scheme | 1 (STRUCTURE.md), 9 (`paths.ts`) |
| 4 Prompt file schemas | 1 (documented), 7, 8 (authored), 9 (validated) |
| 5 Graph builder, three stages | 9, 10, 11 |
| 5 Six drift kinds | 11 |
| 5.1 Output shape | 9 (types), 11 (emit) |
| 6 Visualizer, three tabs, dagre, panel, banner, cross-toggle | 12, 13 |
| 7 Test application, BR-0001..0004, ADR-0001..0003, Docker | 2, 3, 4, 5, 6, 7 |
| 8 `/add-feature` skill | 14 |
| 9 Testing strategy | 2, 3, 4, 5, 9, 10, 11, 13 |
| 10 Out of scope | Respected: no database, no auth, read-only canvas, TypeScript only, no auto-repair. |

**Known deviations from the spec, both deliberate:**

1. The spec named "`index.ts` barrel files" as a hardcoded exclusion. This plan drops the special case and ships `**/index.ts` inside `prompts/.xsrcignore` instead. Same effect, one code path.
2. The spec left `missing-function` attached to the file node with no function node. This plan also synthesizes the function node, so a call edge that points at an undocumented function resolves rather than reporting a second, misleading `broken-ref`.
