import raw from './../generated/graph.json';
import type { Graph, GraphEdge, GraphNode, TabName } from './types.js';

export function loadGraph(): Graph {
  return raw as Graph;
}

/**
 * Pick the nodes and edges for one tab.
 * With showCross off, keep only the nodes whose own tab matches.
 * With showCross on, add every node that a cross edge from this tab reaches.
 */
export function selectForTab(
  graph: Graph,
  tab: TabName,
  showCross: boolean,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const own = new Set(graph.nodes.filter((n) => n.tab === tab).map((n) => n.id));

  if (!showCross) {
    const nodes = graph.nodes.filter((n) => own.has(n.id));
    const edges = graph.edges.filter((e) => own.has(e.source) && own.has(e.target));
    return { nodes, edges };
  }

  const reached = new Set(own);
  for (const e of graph.edges) {
    if (own.has(e.source)) reached.add(e.target);
    if (own.has(e.target)) reached.add(e.source);
  }
  const nodes = graph.nodes.filter((n) => reached.has(n.id));
  const edges = graph.edges.filter((e) => reached.has(e.source) && reached.has(e.target));
  return { nodes, edges };
}
