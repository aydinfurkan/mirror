import { describe, expect, it } from 'vitest';
import { renderFieldValue } from './SidePanel.js';

describe('renderFieldValue', () => {
  it('joins an array as a comma-separated string', () => {
    expect(renderFieldValue(['a', 'b', 'c'])).toBe('a, b, c');
  });

  it('renders an object as JSON, not "[object Object]"', () => {
    const result = renderFieldValue({ foo: 'bar' });
    expect(result).not.toBe('[object Object]');
    expect(result).toBe('{"foo":"bar"}');
  });

  it('passes a plain string through unchanged', () => {
    expect(renderFieldValue('active')).toBe('active');
  });
});
