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

export const DEFAULT_SRC_ROOT = 'code/src';

/** Read the source root from `<mirrorDir>/config.json`. An absent file keeps the default. */
export async function readSrcRoot(mirrorDir: string): Promise<string> {
  let raw: string;
  try {
    raw = await readFile(path.join(mirrorDir, 'config.json'), 'utf8');
  } catch (error) {
    // An absent config.json is legitimate. The default source root then applies.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return DEFAULT_SRC_ROOT;
    throw error;
  }
  const src = (JSON.parse(raw) as { src?: unknown }).src;
  if (src === undefined) return DEFAULT_SRC_ROOT;
  if (typeof src !== 'string' || src.trim().length === 0) {
    throw new Error('The key "src" in config.json must be a path.');
  }
  return toPosix(src.trim()).replace(/\/+$/, '');
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
