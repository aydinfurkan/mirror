import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { EdgeKind, GraphEdge, GraphNode } from '../../src/graph/types.js';
import { fileIdFromXsrcPath, functionId, toPosix } from './paths.js';

export interface PromptPass {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface FunctionEntry {
  name: string;
  input: string;
  output: string;
  responsibility: string;
  calls: string[];
}

/**
 * List every Markdown file under one prompt folder.
 * The three prompt folders are required. A missing folder is a configuration error,
 * not an empty result. A drift report built on silence would look clean.
 */
async function listMarkdown(dir: string): Promise<string[]> {
  const found: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name.endsWith('.md')) found.push(full);
    }
  }
  try {
    await walk(dir);
  } catch (cause) {
    throw new Error(`Cannot read the prompt folder ${toPosix(dir)}. Create the folder.`, {
      cause,
    });
  }
  return found.sort();
}

function requireString(value: unknown, field: string, where: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${where}: the field "${field}" must be a non-empty string.`);
  }
  return value;
}

/**
 * YAML turns an unquoted date scalar such as `date: 2026-08-21` into a native Date.
 * Accept both that and a quoted string, and return the calendar date. An author of a
 * prompt must not have to quote a date, and `graph.json` must not carry a time part.
 */
function requireDateString(value: unknown, where: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return requireString(value, 'date', where);
}

function asList(value: unknown, field: string, where: string): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
    throw new Error(`${where}: the field "${field}" must be a list of strings.`);
  }
  return value as string[];
}

function edge(
  source: string,
  target: string,
  kind: EdgeKind,
  tab: GraphEdge['tab'],
): GraphEdge {
  return { id: `${source}->${target}:${kind}`, source, target, kind, tab, drift: [] };
}

export async function parsePrompts(
  promptsDir: string,
  srcTabs: string[] = ['xsrc'],
): Promise<PromptPass> {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const kind of ['business', 'technical'] as const) {
    for (const file of await listMarkdown(path.join(promptsDir, kind))) {
      const where = toPosix(path.relative(promptsDir, file));
      const { data, content } = matter(await readFile(file, 'utf8'));
      const id = requireString(data.id, 'id', where);
      const expectedPrefix = kind === 'business' ? 'BR-' : 'ADR-';
      if (!path.basename(file).startsWith(`${id}-`)) {
        throw new Error(`${where}: the id "${id}" does not match the filename.`);
      }
      if (!id.startsWith(expectedPrefix)) {
        throw new Error(`${where}: the id "${id}" must start with "${expectedPrefix}".`);
      }
      requireString(data.status, 'status', where);
      // Normalize before the spread below copies the frontmatter onto the node.
      if (kind === 'technical') {
        data.date = requireDateString(data.date, where);
      }
      nodes.push({
        id,
        kind,
        title: requireString(data.title, 'title', where),
        tab: kind,
        parent: null,
        data: { ...data },
        body: content.trim(),
        drift: [],
      });

      if (kind === 'business') {
        for (const other of asList(data.relates_to, 'relates_to', where)) {
          edges.push(edge(id, other, 'relates_to', 'business'));
        }
        for (const fn of asList(data.implemented_by, 'implemented_by', where)) {
          edges.push(edge(id, fn, 'implemented_by', 'cross'));
        }
      } else {
        for (const br of asList(data.driven_by, 'driven_by', where)) {
          edges.push(edge(id, br, 'driven_by', 'cross'));
        }
        for (const adr of asList(data.supersedes, 'supersedes', where)) {
          edges.push(edge(id, adr, 'supersedes', 'technical'));
        }
      }
    }
  }

  for (const srcTab of srcTabs) {
    const xsrcDir = path.join(promptsDir, srcTab);
    for (const file of await listMarkdown(xsrcDir)) {
      const rel = toPosix(path.relative(xsrcDir, file));
      const where = `${srcTab}/${rel}`;
      const { data, content } = matter(await readFile(file, 'utf8'));
      const fileId = `${srcTab}/${fileIdFromXsrcPath(rel)}`;
      const declaredId = requireString(data.id, 'id', where);
      if (declaredId !== fileId) {
        throw new Error(`${where}: the id "${declaredId}" does not match the path "${fileId}".`);
      }
      requireString(data.mirrors, 'mirrors', where);

      nodes.push({
        id: fileId,
        kind: 'file',
        title: fileId,
        tab: srcTab,
        parent: null,
        data: { ...data },
        body: content.trim(),
        drift: [],
      });

      for (const br of asList(data.implements, 'implements', where)) {
        edges.push(edge(fileId, br, 'implements', 'cross'));
      }
      for (const adr of asList(data.decisions, 'decisions', where)) {
        edges.push(edge(fileId, adr, 'decisions', 'cross'));
      }

      const rawFunctions = data.functions;
      if (rawFunctions === undefined) {
        throw new Error(`${where}: the field "functions" is required. Use [] for a type-only file.`);
      }
      if (!Array.isArray(rawFunctions)) {
        throw new Error(`${where}: the field "functions" must be a list.`);
      }
      for (const raw of rawFunctions as Record<string, unknown>[]) {
        const name = requireString(raw.name, 'functions[].name', where);
        const entry: FunctionEntry = {
          name,
          input: requireString(raw.input, `functions[${name}].input`, where),
          output: requireString(raw.output, `functions[${name}].output`, where),
          responsibility: requireString(
            raw.responsibility,
            `functions[${name}].responsibility`,
            where,
          ),
          calls: asList(raw.calls, `functions[${name}].calls`, where),
        };
        const fnId = functionId(fileId, name);
        nodes.push({
          id: fnId,
          kind: 'function',
          title: name,
          tab: srcTab,
          parent: fileId,
          data: { ...entry },
          body: '',
          drift: [],
        });
        for (const target of entry.calls) {
          edges.push(edge(fnId, target, 'calls', srcTab));
        }
      }
    }
  }

  return { nodes, edges };
}
