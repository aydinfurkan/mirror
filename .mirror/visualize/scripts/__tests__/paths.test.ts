import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { DEFAULT_SRC_ROOT, readSrcRoot } from '../lib/paths.js';

const created: string[] = [];

/** Write a config.json into a fresh folder. Omit the body to leave the folder empty. */
async function makeMirrorDir(body?: string): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'mirror-cfg-'));
  created.push(dir);
  if (body !== undefined) await writeFile(path.join(dir, 'config.json'), body, 'utf8');
  return dir;
}

afterAll(async () => {
  await Promise.all(created.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('readSrcRoot', () => {
  it('returns the default when config.json is absent', async () => {
    expect(await readSrcRoot(await makeMirrorDir())).toBe(DEFAULT_SRC_ROOT);
  });

  it('returns the default when config.json declares no src', async () => {
    expect(await readSrcRoot(await makeMirrorDir('{ "test": "npm test" }'))).toBe(DEFAULT_SRC_ROOT);
  });

  it('returns the declared src', async () => {
    expect(await readSrcRoot(await makeMirrorDir('{ "src": "src" }'))).toBe('src');
  });

  it('normalises separators and drops a trailing slash', async () => {
    expect(await readSrcRoot(await makeMirrorDir('{ "src": "packages\\\\api\\\\src/" }'))).toBe(
      'packages/api/src',
    );
  });

  it('refuses an src that is not a path', async () => {
    await expect(readSrcRoot(await makeMirrorDir('{ "src": "" }'))).rejects.toThrow('must be a path');
    await expect(readSrcRoot(await makeMirrorDir('{ "src": 7 }'))).rejects.toThrow('must be a path');
  });
});
