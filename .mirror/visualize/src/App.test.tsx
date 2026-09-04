import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App.js';
import type { Graph } from './graph/types.js';

const graph: Graph = {
  generatedAt: '2026-08-21T00:00:00.000Z',
  nodes: [
    { id: 'BR-0001', kind: 'business', title: 'Greeting', tab: 'business', parent: null,
      data: { status: 'active' }, body: '## Rule\n\nGreet the user by name.', drift: [] },
    { id: 'ADR-0001', kind: 'technical', title: 'Use TypeScript', tab: 'technical', parent: null,
      data: { status: 'accepted' }, body: '## Decision\n\nWrite the fixture in TypeScript.', drift: [] },
    { id: 'xsrc/domain/greet', kind: 'file', title: 'domain/greet', tab: 'xsrc', parent: null,
      data: { mirrors: 'code/src/domain/greet.ts' }, body: '', drift: [] },
    { id: 'domain/greet#greet', kind: 'function', title: 'greet', tab: 'xsrc', parent: 'xsrc/domain/greet',
      data: { input: 'Accept a name string.' }, body: 'Return a greeting string.',
      drift: [{ kind: 'orphan-function', id: 'domain/greet#greet', message: 'Find no exported function greet.' }] },
  ],
  edges: [
    { id: 'BR-0001->greet:implemented_by', source: 'BR-0001', target: 'domain/greet#greet',
      kind: 'implemented_by', tab: 'cross', drift: [] },
  ],
  driftSummary: { 'missing-prompt': 0, 'orphan-prompt': 0, 'missing-function': 0,
    'orphan-function': 1, 'call-drift': 0, 'broken-ref': 0 },
};

// The canvas lists a node under its title. The file node is "domain/greet", so an exact
// name match reaches the function node alone.
function functionNode() {
  return screen.getByRole('button', { name: 'greet' });
}

describe('App', () => {
  it('opens on the business tab', () => {
    render(<App graph={graph} />);
    expect(screen.getByRole('tab', { name: 'business' })).toHaveAttribute('aria-selected', 'true');
  });

  it('switches to the technical tab', async () => {
    render(<App graph={graph} />);
    await userEvent.click(screen.getByRole('tab', { name: 'technical' }));
    expect(screen.getByRole('tab', { name: 'technical' })).toHaveAttribute('aria-selected', 'true');
  });

  it('shows the drift counts in the banner', () => {
    render(<App graph={graph} />);
    const banner = screen.getByTestId('drift-banner');
    // Assert on the banner's whole text: "1" appears in both the total and the chip,
    // so getByText(/1/) would match two elements and throw.
    expect(banner).toHaveTextContent('orphan-function');
    expect(banner).toHaveTextContent('1 drift');
  });

  it('shows the business tab as a document view and draws no canvas', () => {
    render(<App graph={graph} />);
    expect(screen.queryByTestId('canvas')).not.toBeInTheDocument();
    const article = screen.getByTestId('doc-article');
    expect(within(article).getByRole('heading', { name: 'Rule' })).toBeInTheDocument();
    expect(within(article).getByText('Greet the user by name.')).toBeInTheDocument();
  });

  it('shows the technical tab as a document view and draws no canvas', async () => {
    render(<App graph={graph} />);
    await userEvent.click(screen.getByRole('tab', { name: 'technical' }));
    expect(screen.queryByTestId('canvas')).not.toBeInTheDocument();
    const article = screen.getByTestId('doc-article');
    expect(within(article).getByRole('heading', { name: 'Decision' })).toBeInTheDocument();
  });

  it('draws the canvas on the xsrc tab', async () => {
    render(<App graph={graph} />);
    await userEvent.click(screen.getByRole('tab', { name: 'xsrc' }));
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.queryByTestId('doc-article')).not.toBeInTheDocument();
  });

  it('hides the implementation switch and the drift filter on a document tab', async () => {
    render(<App graph={graph} />);
    expect(screen.queryByLabelText('show implementations')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /drift only/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'technical' }));
    expect(screen.queryByLabelText('show implementations')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /drift only/ })).not.toBeInTheDocument();
  });

  it('shows the implementation switch and the drift filter on the xsrc tab', async () => {
    render(<App graph={graph} />);
    await userEvent.click(screen.getByRole('tab', { name: 'xsrc' }));
    expect(screen.getByLabelText('show implementations')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /drift only/ })).toBeInTheDocument();
  });

  it('opens the side panel with the prompt body when an xsrc node is selected', async () => {
    render(<App graph={graph} />);
    await userEvent.click(screen.getByRole('tab', { name: 'xsrc' }));
    await userEvent.click(functionNode());
    const panel = screen.getByTestId('side-panel');
    expect(within(panel).getByText('Return a greeting string.')).toBeInTheDocument();
    expect(within(panel).getByText(/orphan-function/)).toBeInTheDocument();
  });

  it('jumps from the xsrc panel to the business document', async () => {
    render(<App graph={graph} />);
    await userEvent.click(screen.getByRole('tab', { name: 'xsrc' }));
    await userEvent.click(functionNode());
    await userEvent.click(screen.getByRole('button', { name: /BR-0001/ }));
    expect(screen.getByRole('tab', { name: 'business' })).toHaveAttribute('aria-selected', 'true');
    const article = screen.getByTestId('doc-article');
    expect(within(article).getByText('Greeting')).toBeInTheDocument();
    expect(screen.queryByTestId('side-panel')).not.toBeInTheDocument();
  });

  it('closes the side panel', async () => {
    render(<App graph={graph} />);
    await userEvent.click(screen.getByRole('tab', { name: 'xsrc' }));
    await userEvent.click(functionNode());
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByTestId('side-panel')).not.toBeInTheDocument();
  });
});
