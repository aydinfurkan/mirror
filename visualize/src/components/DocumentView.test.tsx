import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DocumentView, documentsForTab } from './DocumentView.js';
import type { Graph, GraphNode } from '../graph/types.js';

function node(partial: Partial<GraphNode> & Pick<GraphNode, 'id' | 'kind' | 'tab'>): GraphNode {
  return {
    title: partial.id,
    parent: null,
    data: {},
    body: '',
    drift: [],
    ...partial,
  } as GraphNode;
}

const graph: Graph = {
  generatedAt: '2026-08-22T00:00:00.000Z',
  nodes: [
    node({ id: 'BR-0002', kind: 'business', tab: 'business', title: 'Second rule',
      data: { status: 'active' }, body: '## Rule\n\nKeep the title short.' }),
    node({ id: 'BR-0001', kind: 'business', tab: 'business', title: 'First rule',
      data: { status: 'draft' }, body: '## Rule\n\n- one\n- two' }),
    node({ id: 'ADR-0001', kind: 'technical', tab: 'technical', title: 'A decision',
      data: { status: 'accepted' }, body: '## Decision\n\nUse TypeScript.' }),
    node({ id: 'xsrc/greet', kind: 'file', tab: 'xsrc', data: { mirrors: 'code/src/greet.ts' } }),
    node({ id: 'greet#greet', kind: 'function', tab: 'xsrc', parent: 'xsrc/greet' }),
  ],
  edges: [],
  driftSummary: { 'missing-prompt': 0, 'orphan-prompt': 0, 'missing-function': 0,
    'orphan-function': 0, 'call-drift': 0, 'broken-ref': 0 },
};

const empty: Graph = { ...graph, nodes: [] };

describe('documentsForTab', () => {
  it('lists the prompts of the tab in ascending id order', () => {
    expect(documentsForTab(graph, 'business').map((n) => n.id)).toEqual(['BR-0001', 'BR-0002']);
  });

  it('lists no function prompt and no prompt of another tab', () => {
    const ids = documentsForTab(graph, 'technical').map((n) => n.id);
    expect(ids).toEqual(['ADR-0001']);
  });
});

describe('DocumentView', () => {
  it('selects the first prompt of the index when no prompt is selected', () => {
    render(<DocumentView graph={graph} tab="business" selectedId={null} onSelect={() => {}} />);
    expect(within(screen.getByTestId('doc-article')).getByText('First rule')).toBeInTheDocument();
  });

  it('falls back to the first prompt when the selection belongs to another tab', () => {
    render(<DocumentView graph={graph} tab="business" selectedId="ADR-0001" onSelect={() => {}} />);
    expect(within(screen.getByTestId('doc-article')).getByText('First rule')).toBeInTheDocument();
  });

  it('shows the id and the status of the selected prompt', () => {
    render(<DocumentView graph={graph} tab="business" selectedId="BR-0002" onSelect={() => {}} />);
    const article = screen.getByTestId('doc-article');
    expect(article).toHaveTextContent('BR-0002');
    expect(article).toHaveTextContent('active');
  });

  it('renders the body of the selected prompt as a formatted document', () => {
    render(<DocumentView graph={graph} tab="business" selectedId="BR-0001" onSelect={() => {}} />);
    const article = screen.getByTestId('doc-article');
    expect(within(article).getByRole('heading', { name: 'Rule' })).toBeInTheDocument();
    expect(within(article).getAllByRole('listitem')).toHaveLength(2);
  });

  it('reports the chosen id when the reader clicks the index', async () => {
    const chosen: string[] = [];
    render(
      <DocumentView graph={graph} tab="business" selectedId="BR-0001"
        onSelect={(id) => chosen.push(id)} />,
    );
    await userEvent.click(within(screen.getByTestId('doc-index')).getByText(/Second rule/));
    expect(chosen).toEqual(['BR-0002']);
  });

  it('says that the business tab holds no prompt', () => {
    render(<DocumentView graph={empty} tab="business" selectedId={null} onSelect={() => {}} />);
    expect(screen.getByText('No business rules yet.')).toBeInTheDocument();
    expect(screen.queryByTestId('doc-article')).not.toBeInTheDocument();
  });

  it('says that the technical tab holds no prompt', () => {
    render(<DocumentView graph={empty} tab="technical" selectedId={null} onSelect={() => {}} />);
    expect(screen.getByText('No technical decisions yet.')).toBeInTheDocument();
  });

  it('says that the selected prompt holds an empty body', () => {
    const bodiless: Graph = {
      ...graph,
      nodes: [node({ id: 'BR-0009', kind: 'business', tab: 'business', title: 'Bodiless',
        data: { status: 'draft' }, body: '' })],
    };
    render(<DocumentView graph={bodiless} tab="business" selectedId={null} onSelect={() => {}} />);
    expect(screen.getByText('This prompt has no body.')).toBeInTheDocument();
  });
});
