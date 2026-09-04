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

/** A file id is `<tab>/<path under that tab's source root>`. */
export function tabOfFileId(fileId: string): string {
  return fileId.split('/')[0];
}

export function srcPathOfFileId(fileId: string, roots: SrcRoots): string {
  const [tab, ...rest] = fileId.split('/');
  return `${roots[tab] ?? tab}/${rest.join('/')}.ts`;
}

export function functionId(fileId: string, name: string): string {
  return `${fileId}#${name}`;
}

/** One source root per tab, keyed by tab name. */
export type SrcRoots = Record<string, string>;

export const DEFAULT_SRC_ROOTS: SrcRoots = { xsrc: 'code/src' };

const RESERVED_TABS = new Set(['business', 'technical']);

function normalizeRoot(tab: string, value: unknown): string {
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(tab) || RESERVED_TABS.has(tab)) {
    throw new Error(`The key "${tab}" in config.json is not a usable tab name.`);
  }
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`The source root "${tab}" in config.json must be a path.`);
  }
  return toPosix(value.trim()).replace(/\/+$/, '');
}

/**
 * Read the source roots from `<mirrorDir>/config.json`. An absent file keeps the default.
 * `"src"` takes either one path, which becomes the `xsrc` tab, or an object that maps
 * a tab name to its own source root.
 */
export async function readSrcRoots(mirrorDir: string): Promise<SrcRoots> {
  let raw: string;
  try {
    raw = await readFile(path.join(mirrorDir, 'config.json'), 'utf8');
  } catch (error) {
    // An absent config.json is legitimate. The default source root then applies.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return DEFAULT_SRC_ROOTS;
    throw error;
  }
  const src = (JSON.parse(raw) as { src?: unknown }).src;
  if (src === undefined) return DEFAULT_SRC_ROOTS;
  if (typeof src === 'string') return { xsrc: normalizeRoot('xsrc', src) };
  if (typeof src !== 'object' || src === null || Array.isArray(src)) {
    throw new Error('The key "src" in config.json must be a path or a map of tab to path.');
  }
  const entries = Object.entries(src);
  if (entries.length === 0) {
    throw new Error('The key "src" in config.json must name at least one source root.');
  }
  return Object.fromEntries(entries.map(([tab, value]) => [tab, normalizeRoot(tab, value)]));
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
