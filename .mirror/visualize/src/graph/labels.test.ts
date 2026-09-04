import { describe, expect, it } from 'vitest';
import { edgeLabel } from './labels.js';

describe('edgeLabel', () => {
  it('gives a call edge no label', () => {
    expect(edgeLabel('calls')).toBeUndefined();
  });

  it('labels a cross edge with its kind', () => {
    expect(edgeLabel('implements')).toBe('implements');
    expect(edgeLabel('implemented_by')).toBe('implemented_by');
    expect(edgeLabel('decisions')).toBe('decisions');
  });
});
