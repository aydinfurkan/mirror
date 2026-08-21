import dagre from '@dagrejs/dagre';
import type { GraphEdge, GraphNode } from './graph/types.js';

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 64;

export interface PositionedNode extends GraphNode {
  x: number;
  y: number;
}

export function layout(nodes: GraphNode[], edges: GraphEdge[]): PositionedNode[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 90 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  const ids = new Set(nodes.map((n) => n.id));
  for (const edge of edges) {
    if (ids.has(edge.source) && ids.has(edge.target)) g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const placed = g.node(node.id);
    return {
      ...node,
      x: (placed?.x ?? 0) - NODE_WIDTH / 2,
      y: (placed?.y ?? 0) - NODE_HEIGHT / 2,
    };
  });
}
