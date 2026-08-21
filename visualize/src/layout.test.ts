import { describe, expect, it } from 'vitest';
import type { GraphEdge, GraphNode } from './graph/types.js';
import { layout, NODE_HEIGHT, NODE_WIDTH } from './layout.js';

const EPS = 0.5;

function node(overrides: Partial<GraphNode> & Pick<GraphNode, 'id'>): GraphNode {
  return {
    kind: 'function',
    title: overrides.id,
    tab: 'xsrc',
    parent: null,
    data: {},
    body: '',
    drift: [],
    ...overrides,
  };
}

function edge(id: string, source: string, target: string): GraphEdge {
  return { id, source, target, kind: 'calls', tab: 'xsrc', drift: [] };
}

describe('layout', () => {
  it('returns every input node exactly once, containers included', () => {
    const nodes: GraphNode[] = [
      node({ id: 'fileA', kind: 'file' }),
      node({ id: 'fileA#fn1', parent: 'fileA' }),
      node({ id: 'fileA#fn2', parent: 'fileA' }),
      node({ id: 'lonely', kind: 'business', tab: 'business' }),
    ];
    const edges: GraphEdge[] = [edge('fn1->fn2', 'fileA#fn1', 'fileA#fn2')];

    const result = layout(nodes, edges);

    expect(result).toHaveLength(nodes.length);
    expect(new Set(result.map((n) => n.id))).toEqual(new Set(nodes.map((n) => n.id)));
    // No duplicates.
    expect(result.map((n) => n.id)).toHaveLength(new Set(result.map((n) => n.id)).size);
  });

  it("sizes a container to contain every child's box in the container's own coordinate space", () => {
    const nodes: GraphNode[] = [
      node({ id: 'fileA', kind: 'file' }),
      node({ id: 'fileA#fn1', parent: 'fileA' }),
      node({ id: 'fileA#fn2', parent: 'fileA' }),
      node({ id: 'fileA#fn3', parent: 'fileA' }),
    ];
    const edges: GraphEdge[] = [
      edge('fn1->fn2', 'fileA#fn1', 'fileA#fn2'),
      edge('fn2->fn3', 'fileA#fn2', 'fileA#fn3'),
    ];

    const result = layout(nodes, edges);
    const container = result.find((n) => n.id === 'fileA');
    const children = result.filter((n) => n.parent === 'fileA');

    expect(container).toBeDefined();
    expect(children).toHaveLength(3);

    for (const child of children) {
      // Child coordinates are relative to the container's own top-left corner.
      expect(child.x).toBeGreaterThanOrEqual(-EPS);
      expect(child.y).toBeGreaterThanOrEqual(-EPS);
      expect(child.x + child.width).toBeLessThanOrEqual(container!.width + EPS);
      expect(child.y + child.height).toBeLessThanOrEqual(container!.height + EPS);
    }
  });

  it("returns each child's x/y relative to its parent, reproducing an absolute position inside the parent's box", () => {
    const nodes: GraphNode[] = [
      node({ id: 'fileA', kind: 'file' }),
      node({ id: 'fileA#fn1', parent: 'fileA' }),
      node({ id: 'fileA#fn2', parent: 'fileA' }),
    ];
    const edges: GraphEdge[] = [edge('fn1->fn2', 'fileA#fn1', 'fileA#fn2')];

    const result = layout(nodes, edges);
    const container = result.find((n) => n.id === 'fileA')!;
    const children = result.filter((n) => n.parent === 'fileA');

    for (const child of children) {
      const absoluteX = container.x + child.x;
      const absoluteY = container.y + child.y;

      expect(absoluteX).toBeGreaterThanOrEqual(container.x - EPS);
      expect(absoluteX + child.width).toBeLessThanOrEqual(container.x + container.width + EPS);
      expect(absoluteY).toBeGreaterThanOrEqual(container.y - EPS);
      expect(absoluteY + child.height).toBeLessThanOrEqual(container.y + container.height + EPS);
    }
  });

  it('places every container before all of its children in the returned array', () => {
    const nodes: GraphNode[] = [
      node({ id: 'fileB#fn1', parent: 'fileB' }),
      node({ id: 'fileA#fn1', parent: 'fileA' }),
      node({ id: 'fileA', kind: 'file' }),
      node({ id: 'fileA#fn2', parent: 'fileA' }),
      node({ id: 'fileB', kind: 'file' }),
      node({ id: 'fileB#fn2', parent: 'fileB' }),
    ];
    const edges: GraphEdge[] = [
      edge('a1->a2', 'fileA#fn1', 'fileA#fn2'),
      edge('b1->b2', 'fileB#fn1', 'fileB#fn2'),
    ];

    const result = layout(nodes, edges);
    const indexOf = (id: string) => result.findIndex((n) => n.id === id);

    expect(indexOf('fileA')).toBeGreaterThanOrEqual(0);
    expect(indexOf('fileB')).toBeGreaterThanOrEqual(0);
    expect(indexOf('fileA')).toBeLessThan(indexOf('fileA#fn1'));
    expect(indexOf('fileA')).toBeLessThan(indexOf('fileA#fn2'));
    expect(indexOf('fileB')).toBeLessThan(indexOf('fileB#fn1'));
    expect(indexOf('fileB')).toBeLessThan(indexOf('fileB#fn2'));
  });

  it('gives a node with no parent and no edges a valid position', () => {
    const nodes: GraphNode[] = [node({ id: 'solo', kind: 'business', tab: 'business' })];
    const result = layout(nodes, []);

    expect(result).toHaveLength(1);
    const [solo] = result;
    expect(Number.isFinite(solo.x)).toBe(true);
    expect(Number.isFinite(solo.y)).toBe(true);
    expect(solo.width).toBe(NODE_WIDTH);
    expect(solo.height).toBe(NODE_HEIGHT);
  });

  it('treats a file node with no children as a plain leaf, not a container', () => {
    const nodes: GraphNode[] = [
      node({ id: 'emptyFile', kind: 'file' }),
      node({ id: 'busy#fn', parent: 'busy' }),
      node({ id: 'busy', kind: 'file' }),
    ];
    const result = layout(nodes, []);
    const emptyFile = result.find((n) => n.id === 'emptyFile')!;

    // A childless file gets the ordinary node box, not a dagre cluster box.
    expect(emptyFile.width).toBe(NODE_WIDTH);
    expect(emptyFile.height).toBe(NODE_HEIGHT);
  });
});
