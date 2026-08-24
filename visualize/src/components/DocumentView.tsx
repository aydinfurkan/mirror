import { Markdown } from './Markdown.js';
import { renderFieldValue } from './SidePanel.js';
import type { Graph, GraphNode, TabName } from '../graph/types.js';

const EMPTY_MESSAGE: Record<string, string> = {
  business: 'No business rules yet.',
  technical: 'No technical decisions yet.',
};

/**
 * List the prompts that the document view shows for one tab.
 * A function node carries no prose, so the index drops it.
 */
export function documentsForTab(graph: Graph, tab: TabName): GraphNode[] {
  return graph.nodes
    .filter((n) => n.tab === tab && (n.kind === 'business' || n.kind === 'technical'))
    .sort((a, b) => a.id.localeCompare(b.id));
}

interface Props {
  graph: Graph;
  tab: TabName;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function DocumentView({ graph, tab, selectedId, onSelect }: Props) {
  const documents = documentsForTab(graph, tab);
  // A selection made on another tab names no document here. Fall back to the first one, so
  // the reader always faces text instead of an empty pane.
  const selected = documents.find((n) => n.id === selectedId) ?? documents[0] ?? null;

  if (!selected) {
    return (
      <div className="doc doc--empty" data-testid="doc-empty">
        {EMPTY_MESSAGE[tab] ?? 'No prompts yet.'}
      </div>
    );
  }

  return (
    <div className="doc">
      <nav className="doc__index" data-testid="doc-index" aria-label={`${tab} prompts`}>
        {documents.map((doc) => (
          <button
            key={doc.id}
            className={doc.id === selected.id ? 'doc__link doc__link--active' : 'doc__link'}
            aria-current={doc.id === selected.id}
            onClick={() => onSelect(doc.id)}
          >
            <span className="doc__linkid">{doc.id}</span>
            <span>{doc.title}</span>
          </button>
        ))}
      </nav>

      <article className="doc__article" data-testid="doc-article">
        <div className="doc__meta">
          <code>{selected.id}</code>
          {selected.data.status !== undefined && (
            <span className="doc__status">{renderFieldValue(selected.data.status)}</span>
          )}
        </div>
        <h2>{selected.title}</h2>

        {selected.drift.length > 0 && (
          <ul className="panel__drift">
            {selected.drift.map((d) => (
              <li key={`${d.kind}:${d.id}`}>
                <strong>{d.kind}</strong> {d.message}
              </li>
            ))}
          </ul>
        )}

        {selected.body.trim() === '' ? (
          <p className="doc__nobody">This prompt has no body.</p>
        ) : (
          <div className="doc__md">
            <Markdown body={selected.body} />
          </div>
        )}
      </article>
    </div>
  );
}
