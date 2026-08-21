import {
  DRIFT_KINDS,
  type Drift,
  type DriftKind,
  type Graph,
  type GraphEdge,
  type GraphNode,
} from '../../src/graph/types.js';
import type { CodePass } from './parse-code.js';
import type { PromptPass } from './parse-prompts.js';
import { fileIdFromXsrcId, functionId, xsrcIdFromFileId } from './paths.js';

function drift(kind: DriftKind, id: string, message: string): Drift {
  return { kind, id, message };
}

export function buildGraph(prompts: PromptPass, code: CodePass): Graph {
  const nodes: GraphNode[] = prompts.nodes.map((n) => ({ ...n, drift: [...n.drift] }));
  const edges: GraphEdge[] = prompts.edges.map((e) => ({ ...e, drift: [...e.drift] }));
  const byId = new Map(nodes.map((n) => [n.id, n]));

  const promptFileIds = new Set(
    nodes.filter((n) => n.kind === 'file').map((n) => fileIdFromXsrcId(n.id)),
  );
  const codeFileIds = new Set(Object.keys(code.files));

  // 2. A source file with no mirror.
  for (const fileId of codeFileIds) {
    if (promptFileIds.has(fileId)) continue;
    const node: GraphNode = {
      id: xsrcIdFromFileId(fileId),
      kind: 'file',
      title: fileId,
      tab: 'xsrc',
      parent: null,
      data: { mirrors: `code/src/${fileId}.ts` },
      body: '',
      drift: [
        drift('missing-prompt', xsrcIdFromFileId(fileId), `Write a mirror prompt for code/src/${fileId}.ts.`),
      ],
    };
    nodes.push(node);
    byId.set(node.id, node);
  }

  // 3 and 4. Compare the function sets of each file.
  for (const fileId of new Set([...promptFileIds, ...codeFileIds])) {
    const fileNodeId = xsrcIdFromFileId(fileId);
    const fileNode = byId.get(fileNodeId);
    const codeFunctions = code.files[fileId];

    if (!codeFunctions) {
      fileNode?.drift.push(
        drift('orphan-prompt', fileNodeId, `Find no source file for ${fileNodeId}. Delete the prompt or write the file.`),
      );
      continue;
    }

    const declared = new Set(
      nodes.filter((n) => n.kind === 'function' && n.parent === fileNodeId).map((n) => n.title),
    );

    for (const fn of codeFunctions) {
      if (declared.has(fn.name)) continue;
      fileNode?.drift.push(
        drift('missing-function', fn.id, `Describe the exported function ${fn.name} in ${fileNodeId}.`),
      );
      const node: GraphNode = {
        id: fn.id,
        kind: 'function',
        title: fn.name,
        tab: 'xsrc',
        parent: fileNodeId,
        data: {},
        body: '',
        drift: [],
      };
      nodes.push(node);
      byId.set(node.id, node);
    }

    const actualNames = new Set(codeFunctions.map((fn) => fn.name));
    for (const name of declared) {
      if (actualNames.has(name)) continue;
      byId
        .get(functionId(fileId, name))
        ?.drift.push(
          drift('orphan-function', functionId(fileId, name), `Find no exported function ${name} in code/src/${fileId}.ts.`),
        );
    }
  }

  // 5. Compare the call edges.
  const declaredCalls = new Map(
    edges.filter((e) => e.kind === 'calls').map((e) => [`${e.source}->${e.target}`, e]),
  );
  const actualCalls = new Set<string>();
  for (const functions of Object.values(code.files)) {
    for (const fn of functions) {
      for (const target of fn.calls) actualCalls.add(`${fn.id}->${target}`);
    }
  }

  for (const [key, e] of declaredCalls) {
    if (actualCalls.has(key)) continue;
    // A call declared against a file that has no code at all is already orphan-prompt.
    if (!code.files[e.source.split('#')[0]]) continue;
    e.drift.push(drift('call-drift', e.id, `The prompt declares the call ${key}, but the code does not make it.`));
  }

  for (const key of actualCalls) {
    if (declaredCalls.has(key)) continue;
    const [source, target] = key.split('->');
    const e: GraphEdge = {
      id: `${source}->${target}:calls`,
      source,
      target,
      kind: 'calls',
      tab: 'xsrc',
      drift: [drift('call-drift', `${source}->${target}:calls`, `The code makes the call ${key}, but no prompt declares it.`)],
    };
    edges.push(e);
  }

  // 6. Resolve every edge target. Drop what does not resolve.
  const resolved: GraphEdge[] = [];
  for (const e of edges) {
    if (byId.has(e.target) && byId.has(e.source)) {
      resolved.push(e);
      continue;
    }
    const missing = byId.has(e.target) ? e.source : e.target;
    byId
      .get(e.source)
      ?.drift.push(drift('broken-ref', e.source, `The reference "${missing}" matches no node.`));
  }

  const driftSummary = Object.fromEntries(DRIFT_KINDS.map((k) => [k, 0])) as Record<DriftKind, number>;
  for (const item of [...nodes, ...resolved]) {
    for (const d of item.drift) driftSummary[d.kind] += 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    nodes,
    edges: resolved,
    driftSummary,
  };
}
