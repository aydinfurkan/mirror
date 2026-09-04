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
      await rm(`${root}/docs/xsrc/greet.md`);
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
        `${root}/docs/xsrc/greet.md`,
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
      await patchFile(`${root}/docs/xsrc/app.md`, 'calls: [greet#greet]', 'calls: []');
    });
    expect(driftKinds(graph)).toContain('app#run->greet#greet:calls:call-drift');
    expect(graph.edges.find((e) => e.id === 'app#run->greet#greet:calls')).toBeDefined();
  });

  it('reports broken-ref for a reference to an unknown id', async () => {
    const graph = await graphOf(async (root) => {
      await patchFile(`${root}/docs/xsrc/app.md`, 'implements: [BR-0001]', 'implements: [BR-0099]');
    });
    expect(driftKinds(graph)).toContain('xsrc/app:broken-ref');
    expect(graph.edges.some((e) => e.target === 'BR-0099')).toBe(false);
  });

  it('drops the call-drift on an edge whose target resolves to no node, keeping only broken-ref', async () => {
    const graph = await graphOf(async (root) => {
      await patchFile(
        `${root}/docs/xsrc/app.md`,
        'calls: [greet#greet]',
        'calls: [greet#greet, greet#bogus]',
      );
    });
    expect(driftKinds(graph)).toEqual(['app#run:broken-ref']);
    expect(graph.driftSummary['call-drift']).toBe(0);
    expect(graph.edges.some((e) => e.target === 'greet#bogus')).toBe(false);
  });

  it('stamps the build time', async () => {
    const graph = await graphOf();
    expect(() => new Date(graph.generatedAt).toISOString()).not.toThrow();
  });
});
