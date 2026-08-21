import { Background, Controls, ReactFlow, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo } from 'react';
import type { GraphEdge, GraphNode } from '../graph/types.js';
import { layout } from '../layout.js';

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function Canvas({ nodes, edges, selectedId, onSelect }: Props) {
  const flowNodes: Node[] = useMemo(
    () =>
      layout(nodes, edges).map((node) => ({
        id: node.id,
        position: { x: node.x, y: node.y },
        data: { label: `${node.title}${node.drift.length > 0 ? '  ⚠' : ''}` },
        className: [
          `node node--${node.kind}`,
          node.drift.length > 0 ? 'node--drift' : '',
          node.id === selectedId ? 'node--selected' : '',
        ]
          .filter(Boolean)
          .join(' '),
      })),
    [nodes, edges, selectedId],
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.kind,
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
