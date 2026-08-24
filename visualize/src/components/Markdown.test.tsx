import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Markdown } from './Markdown.js';

describe('Markdown', () => {
  it('renders a "##" line as a heading element, not as literal text', () => {
    render(<Markdown body="## Rule" />);
    const heading = screen.getByRole('heading', { name: 'Rule' });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).not.toContain('#');
  });

  it('renders a deeper heading at a deeper level', () => {
    render(<Markdown body={"## Two\n### Three"} />);
    expect(screen.getByRole('heading', { name: 'Two' }).tagName).toBe('H3');
    expect(screen.getByRole('heading', { name: 'Three' }).tagName).toBe('H4');
  });

  it('renders a "-" line as a list item, not as literal text', () => {
    render(<Markdown body={"- first\n- second"} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('first');
    expect(items[0].textContent).not.toContain('-');
  });

  it('renders a backtick span as a code element', () => {
    render(<Markdown body="Call `createBubble` now." />);
    expect(screen.getByText('createBubble').tagName).toBe('CODE');
  });

  it('renders nothing for an empty body', () => {
    const { container } = render(<Markdown body="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
