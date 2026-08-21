import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App.js';
import type { Graph } from './graph/types.js';

const graph: Graph = {
  generatedAt: '2026-08-21T00:00:00.000Z',
  nodes: [
    { id: 'BR-0001', kind: 'business', title: 'Greeting', tab: 'business', parent: null,
      data: { status: 'active' }, body: 'Greet the user by name.', drift: [] },
    { id: 'ADR-0001', kind: 'technical', title: 'Use TypeScript', tab: 'technical', parent: null,
      data: { status: 'accepted' }, body: 'Write the fixture in TypeScript.', drift: [] },
    { id: 'xsrc/greet', kind: 'file', title: 'greet', tab: 'xsrc', parent: null,
      data: { mirrors: 'code/src/greet.ts' }, body: '', drift: [] },
    { id: 'greet#greet', kind: 'function', title: 'greet', tab: 'xsrc', parent: 'xsrc/greet',
      data: { input: 'Accept a name string.' }, body: '',
      drift: [{ kind: 'orphan-function', id: 'greet#greet', message: 'Find no exported function greet.' }] },
  ],
  edges: [
    { id: 'BR-0001->greet#greet:implemented_by', source: 'BR-0001', target: 'greet#greet',
      kind: 'implemented_by', tab: 'cross', drift: [] },
  ],
  driftSummary: { 'missing-prompt': 0, 'orphan-prompt': 0, 'missing-function': 0,
    'orphan-function': 1, 'call-drift': 0, 'broken-ref': 0 },
};

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

  it('opens the side panel with the prompt body when a node is selected', async () => {
    render(<App graph={graph} />);
    await userEvent.click(screen.getByText('Greeting'));
    const panel = screen.getByTestId('side-panel');
    expect(within(panel).getByText('Greet the user by name.')).toBeInTheDocument();
  });

  it('jumps to a related node in another tab', async () => {
    render(<App graph={graph} />);
    await userEvent.click(screen.getByText('Greeting'));
    await userEvent.click(screen.getByRole('button', { name: /greet#greet/ }));
    expect(screen.getByRole('tab', { name: 'xsrc' })).toHaveAttribute('aria-selected', 'true');
    const panel = screen.getByTestId('side-panel');
    expect(within(panel).getByText(/orphan-function/)).toBeInTheDocument();
  });

  it('closes the side panel', async () => {
    render(<App graph={graph} />);
    await userEvent.click(screen.getByText('Greeting'));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByTestId('side-panel')).not.toBeInTheDocument();
  });
});
