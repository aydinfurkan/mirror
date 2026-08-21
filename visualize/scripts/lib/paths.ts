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
  } catch {
    return [];
  }
}

export function isIgnored(relPath: string, globs: string[]): boolean {
  const posix = toPosix(relPath);
  if (posix.endsWith('.d.ts')) return true;
  return globs.some((glob) => picomatch.isMatch(posix, glob));
}
