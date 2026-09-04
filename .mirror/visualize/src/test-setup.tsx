import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// React Flow measures the DOM, which jsdom does not do. Render a plain list instead.
vi.mock('./components/Canvas.js', () => ({
  Canvas: ({
    nodes,
    onSelect,
  }: {
    nodes: { id: string; title: string }[];
    onSelect: (id: string) => void;
  }) => (
    <div data-testid="canvas">
      {nodes.map((n) => (
        <button key={n.id} onClick={() => onSelect(n.id)}>
          {n.title}
        </button>
      ))}
    </div>
  ),
}));
