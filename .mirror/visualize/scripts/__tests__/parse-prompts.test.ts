import { rm } from 'node:fs/promises';
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
      'xsrc/app',
      'xsrc/app#run',
      'xsrc/greet',
      'xsrc/greet#greet',
    ]);
  });

  it('assigns each node to a tab', async () => {
    const { promptsDir } = await makeRepo();
    const { nodes } = await parsePrompts(promptsDir);
    const byId = new Map(nodes.map((n) => [n.id, n]));
    expect(byId.get('BR-0001')?.tab).toBe('business');
    expect(byId.get('ADR-0001')?.tab).toBe('technical');
    expect(byId.get('xsrc/greet')?.tab).toBe('xsrc');
    expect(byId.get('xsrc/greet#greet')?.tab).toBe('xsrc');
  });

  it('parents a function node to its file node', async () => {
    const { promptsDir } = await makeRepo();
    const { nodes } = await parsePrompts(promptsDir);
    const fn = nodes.find((n) => n.id === 'xsrc/greet#greet');
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

  it('normalizes an unquoted YAML date to a calendar-date string', async () => {
    const { promptsDir } = await makeRepo();
    const { nodes } = await parsePrompts(promptsDir);
    expect(nodes.find((n) => n.id === 'ADR-0001')?.data.date).toBe('2026-08-21');
  });

  it('emits the declared edges with their kinds and tabs', async () => {
    const { promptsDir } = await makeRepo();
    const { edges } = await parsePrompts(promptsDir);
    const summary = edges.map((e) => `${e.source}->${e.target}:${e.kind}:${e.tab}`).sort();
    expect(summary).toEqual([
      'ADR-0001->BR-0001:driven_by:cross',
      'BR-0001->xsrc/greet#greet:implemented_by:cross',
      'xsrc/app#run->xsrc/greet#greet:calls:xsrc',
      'xsrc/app->BR-0001:implements:cross',
      'xsrc/greet->ADR-0001:decisions:cross',
      'xsrc/greet->BR-0001:implements:cross',
    ]);
  });

  it('rejects a prompt whose id does not match its path', async () => {
    const { promptsDir } = await makeRepo(async (root) => {
      const file = `${root}/docs/xsrc/greet.md`;
      const { patchFile } = await import('./helpers.js');
      await patchFile(file, 'id: xsrc/greet', 'id: xsrc/wrong');
    });
    await expect(parsePrompts(promptsDir)).rejects.toThrow(/xsrc\/wrong/);
  });

  it('rejects a function entry that omits the responsibility', async () => {
    const { promptsDir } = await makeRepo(async (root) => {
      const { patchFile } = await import('./helpers.js');
      await patchFile(
        `${root}/docs/xsrc/greet.md`,
        '    responsibility: "Build a greeting from the name."\n',
        '',
      );
    });
    await expect(parsePrompts(promptsDir)).rejects.toThrow(/responsibility/);
  });

  it('reads one prompt folder per source tab', async () => {
    const { promptsDir } = await makeRepo(async (root) => {
      const { cp } = await import('node:fs/promises');
      await cp(`${root}/docs/xsrc`, `${root}/docs/web`, { recursive: true });
      const { patchFile } = await import('./helpers.js');
      await patchFile(`${root}/docs/web/greet.md`, 'id: xsrc/greet', 'id: web/greet');
      await patchFile(`${root}/docs/web/app.md`, 'id: xsrc/app', 'id: web/app');
      await patchFile(`${root}/docs/web/app.md`, 'xsrc/greet#greet', 'web/greet#greet');
    });
    const { nodes } = await parsePrompts(promptsDir, ['xsrc', 'web']);
    expect(nodes.map((n) => n.id)).toContain('web/greet');
    expect(nodes.map((n) => n.id)).toContain('web/greet#greet');
  });

  it('refuses to parse when a prompt folder is missing', async () => {
    const { promptsDir } = await makeRepo(async (root) => {
      await rm(`${root}/docs/xsrc`, { recursive: true, force: true });
    });
    await expect(parsePrompts(promptsDir)).rejects.toThrow(/prompt folder/);
  });
});
