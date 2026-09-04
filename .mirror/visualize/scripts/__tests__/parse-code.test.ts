import { writeFile } from 'node:fs/promises';
import { afterAll, describe, expect, it } from 'vitest';
import { parseCode } from '../lib/parse-code.js';
import { readIgnoreGlobs } from '../lib/paths.js';
import { cleanupRepos, makeRepo } from './helpers.js';

afterAll(cleanupRepos);

async function parseFixture(mutate?: (dir: string) => Promise<void>) {
  const { promptsDir, srcDir } = await makeRepo(mutate);
  return parseCode({ xsrc: srcDir }, await readIgnoreGlobs(promptsDir));
}

describe('parseCode', () => {
  it('finds the exported functions of each file', async () => {
    const pass = await parseFixture();
    expect(Object.keys(pass.files).sort()).toEqual(['xsrc/app', 'xsrc/greet']);
    expect(pass.files['xsrc/greet'].map((f) => f.name)).toEqual(['greet']);
    expect(pass.files['xsrc/app'].map((f) => f.id)).toEqual(['xsrc/app#run']);
  });

  it('records a cross-file call', async () => {
    const pass = await parseFixture();
    expect(pass.files['xsrc/app'][0].calls).toEqual(['xsrc/greet#greet']);
  });

  it('skips a file that the ignore list matches', async () => {
    const pass = await parseFixture();
    expect(pass.files).not.toHaveProperty('xsrc/index');
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
    expect(pass.files['xsrc/app'].map((f) => f.name)).toEqual(['run']);
    expect(pass.files['xsrc/app'][0].calls).toEqual(['xsrc/greet#greet']);
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
    expect(pass.files['xsrc/app'][0].calls).toEqual(['xsrc/greet#greet']);
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
    expect(pass.files['xsrc/app'][0].calls).toEqual([]);
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
    const run = pass.files['xsrc/app'].find((f) => f.name === 'run');
    expect(run?.calls).toEqual(['xsrc/app#helper']);
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
    expect(pass.files['xsrc/app'].map((f) => f.name)).toEqual(['run']);
    expect(pass.files['xsrc/app'][0].calls).toEqual(['xsrc/greet#greet']);
  });
});
