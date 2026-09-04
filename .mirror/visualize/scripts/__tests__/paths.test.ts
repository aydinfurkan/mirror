import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { DEFAULT_SRC_ROOTS, readSrcRoots } from '../lib/paths.js';

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

describe('readSrcRoots', () => {
  it('returns the default when config.json is absent', async () => {
    expect(await readSrcRoots(await makeMirrorDir())).toEqual(DEFAULT_SRC_ROOTS);
  });

  it('returns the default when config.json declares no src', async () => {
    expect(await readSrcRoots(await makeMirrorDir('{ "test": "npm test" }'))).toEqual(
      DEFAULT_SRC_ROOTS,
    );
  });

  it('reads one declared src as the xsrc tab', async () => {
    expect(await readSrcRoots(await makeMirrorDir('{ "src": "src" }'))).toEqual({ xsrc: 'src' });
  });

  it('reads one source root per tab', async () => {
    const dir = await makeMirrorDir('{ "src": { "api": "api/src", "web": "web/src" } }');
    expect(await readSrcRoots(dir)).toEqual({ api: 'api/src', web: 'web/src' });
  });

  it('normalises separators and drops a trailing slash', async () => {
    expect(await readSrcRoots(await makeMirrorDir('{ "src": "packages\\\\api\\\\src/" }'))).toEqual({
      xsrc: 'packages/api/src',
    });
  });

  it('refuses an src that is not a path', async () => {
    await expect(readSrcRoots(await makeMirrorDir('{ "src": "" }'))).rejects.toThrow(
      'must be a path',
    );
    await expect(readSrcRoots(await makeMirrorDir('{ "src": 7 }'))).rejects.toThrow(
      'must be a path or a map',
    );
    await expect(
      readSrcRoots(await makeMirrorDir('{ "src": { "api": 7 } }')),
    ).rejects.toThrow('must be a path');
  });

  it('refuses a tab name that collides with a fixed tab', async () => {
    await expect(
      readSrcRoots(await makeMirrorDir('{ "src": { "business": "src" } }')),
    ).rejects.toThrow('not a usable tab name');
  });

  it('refuses an empty map', async () => {
    await expect(readSrcRoots(await makeMirrorDir('{ "src": {} }'))).rejects.toThrow(
      'at least one source root',
    );
  });
});
