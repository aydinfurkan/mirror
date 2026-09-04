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
  const code = await parseCode({ xsrc: srcDir }, await readIgnoreGlobs(promptsDir));
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
    expect(graph.nodes.some((n) => n.id === 'xsrc/greet#greet')).toBe(true);
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
    expect(graph.nodes.some((n) => n.id === 'xsrc/greet#shout')).toBe(true);
  });

  it('reports orphan-function for a function the code does not have', async () => {
    const graph = await graphOf(async (root) => {
      await patchFile(
        `${root}/docs/xsrc/greet.md`,
        '    calls: []\n',
        '    calls: []\n  - name: shout\n    input: "Accept a text."\n    output: "Return the text in capitals."\n    responsibility: "Raise the text to capitals."\n    calls: []\n',
      );
    });
    expect(driftKinds(graph)).toContain('xsrc/greet#shout:orphan-function');
  });

  it('reports call-drift for a declared call that the code does not make', async () => {
    const graph = await graphOf(async (root) => {
      await writeFile(`${root}/code/src/app.ts`, "export function run(): string {\n  return 'x';\n}\n", 'utf8');
    });
    expect(driftKinds(graph)).toContain('xsrc/app#run->xsrc/greet#greet:calls:call-drift');
  });

  it('reports call-drift for a call the prompt does not declare', async () => {
    const graph = await graphOf(async (root) => {
      await patchFile(`${root}/docs/xsrc/app.md`, 'calls: [xsrc/greet#greet]', 'calls: []');
    });
    expect(driftKinds(graph)).toContain('xsrc/app#run->xsrc/greet#greet:calls:call-drift');
    expect(graph.edges.find((e) => e.id === 'xsrc/app#run->xsrc/greet#greet:calls')).toBeDefined();
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
        'calls: [xsrc/greet#greet]',
        'calls: [xsrc/greet#greet, xsrc/greet#bogus]',
      );
    });
    expect(driftKinds(graph)).toEqual(['xsrc/app#run:broken-ref']);
    expect(graph.driftSummary['call-drift']).toBe(0);
    expect(graph.edges.some((e) => e.target === 'xsrc/greet#bogus')).toBe(false);
  });

  it('mirrors two source roots as two tabs, with no id collision', async () => {
    const { cp } = await import('node:fs/promises');
    const { root, promptsDir } = await makeRepo(async (dir) => {
      await cp(`${dir}/code/src`, `${dir}/web/src`, { recursive: true });
      await cp(`${dir}/docs/xsrc`, `${dir}/docs/web`, { recursive: true });
      await patchFile(`${dir}/docs/web/greet.md`, 'id: xsrc/greet', 'id: web/greet');
      await patchFile(`${dir}/docs/web/app.md`, 'id: xsrc/app', 'id: web/app');
      await patchFile(`${dir}/docs/web/app.md`, 'xsrc/greet#greet', 'web/greet#greet');
    });
    const srcDirs = { xsrc: `${root}/code/src`, web: `${root}/web/src` };
    const prompts = await parsePrompts(promptsDir, Object.keys(srcDirs));
    const code = await parseCode(srcDirs, await readIgnoreGlobs(promptsDir));
    const graph = buildGraph(prompts, code, { xsrc: 'code/src', web: 'web/src' });

    expect(graph.tabs).toEqual(['xsrc', 'web']);
    expect(driftKinds(graph)).toEqual([]);
    expect(graph.nodes.filter((n) => n.tab === 'web').map((n) => n.id).sort()).toEqual([
      'web/app',
      'web/app#run',
      'web/greet',
      'web/greet#greet',
    ]);
  });

  it('stamps the build time', async () => {
    const graph = await graphOf();
    expect(() => new Date(graph.generatedAt).toISOString()).not.toThrow();
  });
});
