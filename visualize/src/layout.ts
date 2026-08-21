import dagre from '@dagrejs/dagre';
import type { GraphEdge, GraphNode } from './graph/types.js';

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 64;

export interface PositionedNode extends GraphNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Lay out a graph top-down with dagre. Function nodes that name a file node
 * as their `parent` are nested inside that file as a dagre compound-graph
 * cluster, so the xsrc tab renders file containers around their functions
 * instead of a flat list. A node only becomes a container when some other
 * node actually points to it via `parent` — an empty file stays a plain leaf.
 */
export function layout(nodes: GraphNode[], edges: GraphEdge[]): PositionedNode[] {
  const g = new dagre.graphlib.Graph({ compound: true });
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 90 });
  g.setDefaultEdgeLabel(() => ({}));

  const ids = new Set(nodes.map((n) => n.id));
  const containerIds = new Set<string>();
  for (const node of nodes) {
    if (node.parent !== null && ids.has(node.parent)) containerIds.add(node.parent);
  }

  for (const node of nodes) {
    if (containerIds.has(node.id)) {
      g.setNode(node.id, {});
    } else {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }
  }
  for (const node of nodes) {
    if (node.parent !== null && containerIds.has(node.parent)) {
      g.setParent(node.id, node.parent);
    }
  }
  for (const edge of edges) {
    if (ids.has(edge.source) && ids.has(edge.target)) g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const containers = nodes.filter((n) => containerIds.has(n.id));
  const rest = nodes.filter((n) => !containerIds.has(n.id));

  const positioned: PositionedNode[] = [];

  for (const node of containers) {
    const placed = g.node(node.id);
    const width = placed?.width ?? NODE_WIDTH;
    const height = placed?.height ?? NODE_HEIGHT;
    positioned.push({
      ...node,
      x: (placed?.x ?? 0) - width / 2,
      y: (placed?.y ?? 0) - height / 2,
      width,
      height,
    });
  }

  for (const node of rest) {
    const placed = g.node(node.id);
    const width = placed?.width ?? NODE_WIDTH;
    const height = placed?.height ?? NODE_HEIGHT;
    let x = (placed?.x ?? 0) - width / 2;
    let y = (placed?.y ?? 0) - height / 2;

    if (node.parent !== null && containerIds.has(node.parent)) {
      const parentPlaced = g.node(node.parent);
      if (parentPlaced) {
        const parentWidth = parentPlaced.width ?? NODE_WIDTH;
        const parentHeight = parentPlaced.height ?? NODE_HEIGHT;
        x -= parentPlaced.x - parentWidth / 2;
        y -= parentPlaced.y - parentHeight / 2;
      }
    }

    positioned.push({ ...node, x, y, width, height });
  }

  return positioned;
}
