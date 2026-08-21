import type { Graph, GraphNode } from '../graph/types.js';

export function relatedOf(graph: Graph, id: string) {
  return graph.edges.filter((edge) => edge.source === id || edge.target === id);
}

/**
 * Show one frontmatter value as text.
 * Join a list with commas. Print an object as JSON. A bare String() would show
 * "[object Object]" and tell the reader nothing.
 */
export function renderFieldValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return String(value);
}

interface Props {
  graph: Graph;
  node: GraphNode;
  onJump: (id: string) => void;
  onClose: () => void;
}

export function SidePanel({ graph, node, onJump, onClose }: Props) {
  const related = relatedOf(graph, node.id);
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));

  return (
    <aside className="panel" data-testid="side-panel">
      <header className="panel__head">
        <div>
          <div className="panel__kind">{node.kind}</div>
          <h2>{node.title}</h2>
          <code>{node.id}</code>
        </div>
        <button onClick={onClose}>Close</button>
      </header>

      {node.drift.length > 0 && (
        <ul className="panel__drift">
          {node.drift.map((d) => (
            <li key={`${d.kind}:${d.id}`}>
              <strong>{d.kind}</strong> {d.message}
            </li>
          ))}
        </ul>
      )}

      {node.body && <div className="panel__body">{node.body}</div>}

      <dl className="panel__fields">
        {Object.entries(node.data)
          .filter(([key]) => key !== 'functions' && key !== 'id' && key !== 'type')
          .map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{renderFieldValue(value)}</dd>
            </div>
          ))}
      </dl>

      {related.length > 0 && (
        <section className="panel__related">
          <h3>Related</h3>
          <ul>
            {related.map((edge) => {
              const otherId = edge.source === node.id ? edge.target : edge.source;
              const other = byId.get(otherId);
              return (
                <li key={edge.id}>
                  <span className="panel__edgekind">{edge.kind}</span>
                  <button onClick={() => onJump(otherId)}>
                    {other ? `${other.title} · ${otherId}` : otherId}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </aside>
  );
}
