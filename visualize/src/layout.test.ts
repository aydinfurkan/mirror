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

  // Two disconnected containers, side by side, are the fixture for both
  // coordinate tests below. This matters: with a single container spanning
  // the whole graph, dagre normalizes the layout so that container's own
  // absolute origin lands at ~(0, 0) — subtracting "the parent's origin"
  // from a child then subtracts approximately zero, so a layout() that
  // forgot to relativize children at all (left them in absolute dagre
  // coordinates) would produce numerically indistinguishable output and
  // the test would pass for the wrong reason. With two side-by-side
  // containers, dagre must place the second one away from the origin, so
  // "child.x is small" and "child.x is the container's absolute x" are
  // actually different claims, and a broken layout() cannot pass by
  // accident. Do not simplify this back to one container.
  function twoContainerFixture(): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = [
      node({ id: 'fileA', kind: 'file' }),
      node({ id: 'fileA#fn1', parent: 'fileA' }),
      node({ id: 'fileA#fn2', parent: 'fileA' }),
      node({ id: 'fileA#fn3', parent: 'fileA' }),
      node({ id: 'fileB', kind: 'file' }),
      node({ id: 'fileB#fn1', parent: 'fileB' }),
      node({ id: 'fileB#fn2', parent: 'fileB' }),
    ];
    const edges: GraphEdge[] = [
      edge('a1->a2', 'fileA#fn1', 'fileA#fn2'),
      edge('a2->a3', 'fileA#fn2', 'fileA#fn3'),
      edge('b1->b2', 'fileB#fn1', 'fileB#fn2'),
    ];
    return { nodes, edges };
  }

  it("sizes each container to contain every child's box in the container's own coordinate space", () => {
    const { nodes, edges } = twoContainerFixture();
    const result = layout(nodes, edges);

    for (const containerId of ['fileA', 'fileB']) {
      const container = result.find((n) => n.id === containerId)!;
      const children = result.filter((n) => n.parent === containerId);

      expect(container).toBeDefined();
      expect(children.length).toBeGreaterThan(0);

      for (const child of children) {
        // Child coordinates are relative to the container's own top-left corner.
        expect(child.x).toBeGreaterThanOrEqual(-EPS);
        expect(child.y).toBeGreaterThanOrEqual(-EPS);
        expect(child.x + child.width).toBeLessThanOrEqual(container.width + EPS);
        expect(child.y + child.height).toBeLessThanOrEqual(container.height + EPS);
      }
    }
  });

  it("returns each child's x/y relative to its parent, not in absolute dagre coordinates", () => {
    const { nodes, edges } = twoContainerFixture();
    const result = layout(nodes, edges);

    const fileA = result.find((n) => n.id === 'fileA')!;
    const fileB = result.find((n) => n.id === 'fileB')!;

    // Confirm the fixture actually achieves what it is for: with two
    // side-by-side, disconnected containers, dagre cannot place both at
    // the graph origin, so at least one of them must land away from
    // (0, 0). If this assertion ever starts failing, the fixture itself
    // has become degenerate (e.g. a future dagre version centres both
    // containers on the origin) and the assertions below would no longer
    // prove anything — fix the fixture before touching layout.ts.
    const offOrigin = Math.abs(fileB.x) > 100 || Math.abs(fileB.y) > 100 ? fileB : fileA;
    expect(Math.max(Math.abs(offOrigin.x), Math.abs(offOrigin.y))).toBeGreaterThan(100);

    for (const child of result.filter((n) => n.parent === offOrigin.id)) {
      // Relative to its own container, a child must sit inside [0, width] x
      // [0, height]. If layout() left children in absolute dagre
      // coordinates instead of subtracting the parent's origin, a child of
      // the off-origin container would land far outside this range (its
      // absolute position is offset by the container's own non-zero x/y),
      // so this range check only passes for coordinates that are genuinely
      // parent-relative.
      expect(child.x).toBeGreaterThanOrEqual(-EPS);
      expect(child.y).toBeGreaterThanOrEqual(-EPS);
      expect(child.x + child.width).toBeLessThanOrEqual(offOrigin.width + EPS);
      expect(child.y + child.height).toBeLessThanOrEqual(offOrigin.height + EPS);

      // And converting back to absolute coordinates (parent origin + child
      // offset) must land inside the parent's own absolute box.
      const absoluteX = offOrigin.x + child.x;
      const absoluteY = offOrigin.y + child.y;
      expect(absoluteX).toBeGreaterThanOrEqual(offOrigin.x - EPS);
      expect(absoluteX + child.width).toBeLessThanOrEqual(offOrigin.x + offOrigin.width + EPS);
      expect(absoluteY).toBeGreaterThanOrEqual(offOrigin.y - EPS);
      expect(absoluteY + child.height).toBeLessThanOrEqual(offOrigin.y + offOrigin.height + EPS);
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

  it('places the target of an edge to the right of its source, not below it', () => {
    const nodes: GraphNode[] = [node({ id: 'caller' }), node({ id: 'callee' })];
    const placed = layout(nodes, [edge('caller->callee', 'caller', 'callee')]);
    const caller = placed.find((n) => n.id === 'caller')!;
    const callee = placed.find((n) => n.id === 'callee')!;

    // Left to right: the rank advances along x, and both nodes share one row.
    expect(callee.x).toBeGreaterThan(caller.x + NODE_WIDTH);
    expect(Math.abs(callee.y - caller.y)).toBeLessThan(EPS);
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
