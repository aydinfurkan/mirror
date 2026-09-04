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
  const root = await mkdtemp(path.join(os.tmpdir(), 'mirror-'));
  created.push(root);
  await cp(CLEAN_FIXTURE, root, { recursive: true });
  if (mutate) await mutate(root);
  return {
    root,
    promptsDir: path.join(root, 'docs'),
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
