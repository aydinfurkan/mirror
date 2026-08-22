import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo } from 'react';
import { edgeLabel } from '../graph/labels.js';
import type { GraphEdge, GraphNode } from '../graph/types.js';
import { layout } from '../layout.js';

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * React Flow's built-in `group` node type renders nothing (it is meant to be
 * a plain resize/drag surface), so a file container needs its own renderer
 * to keep the file name visible at the top of the cluster.
 */
function FileGroupNode({ data }: NodeProps) {
  const label = typeof data.label === 'string' ? data.label : '';
  return <div className="node-group__label">{label}</div>;
}

const nodeTypes = { group: FileGroupNode };

export function Canvas({ nodes, edges, selectedId, onSelect }: Props) {
  const flowNodes: Node[] = useMemo(() => {
    const ids = new Set(nodes.map((n) => n.id));
    const containerIds = new Set<string>();
    for (const node of nodes) {
      if (node.parent !== null && ids.has(node.parent)) containerIds.add(node.parent);
    }

    return layout(nodes, edges).map((node) => {
      const isContainer = containerIds.has(node.id);
      const className = [
        `node node--${node.kind}`,
        isContainer ? 'node--container' : '',
        node.drift.length > 0 ? 'node--drift' : '',
        node.id === selectedId ? 'node--selected' : '',
      ]
        .filter(Boolean)
        .join(' ');

      return {
        id: node.id,
        position: { x: node.x, y: node.y },
        data: { label: `${node.title}${node.drift.length > 0 ? '  ⚠' : ''}` },
        className,
        ...(isContainer
          ? { type: 'group', style: { width: node.width, height: node.height } }
          : {}),
        ...(node.parent !== null && containerIds.has(node.parent)
          ? { parentId: node.parent, extent: 'parent' as const }
          : {}),
      };
    });
  }, [nodes, edges, selectedId]);

  const flowEdges: Edge[] = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edgeLabel(edge.kind),
        animated: edge.kind === 'calls',
        className: edge.drift.length > 0 ? 'edge edge--drift' : 'edge',
      })),
    [edges],
  );

  return (
    <div className="canvas" data-testid="canvas">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={(_event, node) => onSelect(node.id)}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
