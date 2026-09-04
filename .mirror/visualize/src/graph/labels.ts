import type { EdgeKind } from './types.js';

/**
 * Give the canvas the text for one edge.
 * The xsrc tab draws mostly call edges, and the word "calls" on every line hides the graph
 * instead of explaining it. The animation on a call edge already tells the reader the kind.
 */
export function edgeLabel(kind: EdgeKind): string | undefined {
  return kind === 'calls' ? undefined : kind;
}
