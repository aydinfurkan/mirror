import { describe, expect, it } from 'vitest';
import type { Bubble } from '../../src/domain/bubble.model.js';
import {
  MAX_TITLE_LENGTH,
  isCompletable,
  sortNewestFirst,
  validateTitle,
} from '../../src/domain/bubble.rules.js';

function bubble(overrides: Partial<Bubble> = {}): Bubble {
  return {
    id: 'b1',
    title: 'Ship the parser',
    ownerId: 'u1',
    state: 'open',
    createdAt: '2026-08-21T10:00:00.000Z',
    completedAt: null,
    ...overrides,
  };
}

describe('validateTitle', () => {
  it('accepts a normal title', () => {
    expect(validateTitle('Ship the parser')).toBeNull();
  });

  it('rejects an empty title', () => {
    expect(validateTitle('')).toEqual({ field: 'title', message: 'Enter a title.' });
  });

  it('rejects a whitespace-only title', () => {
    expect(validateTitle('   ')).toEqual({ field: 'title', message: 'Enter a title.' });
  });

  it('accepts a title of exactly the maximum length', () => {
    expect(validateTitle('x'.repeat(MAX_TITLE_LENGTH))).toBeNull();
  });

  it('rejects a title longer than the maximum length', () => {
    expect(validateTitle('x'.repeat(MAX_TITLE_LENGTH + 1))).toEqual({
      field: 'title',
      message: 'Use 120 characters or fewer in the title.',
    });
  });
});

describe('isCompletable', () => {
  it('allows an open bubble to be completed', () => {
    expect(isCompletable(bubble({ state: 'open' }))).toBe(true);
  });

  it('refuses a bubble that is already done', () => {
    expect(isCompletable(bubble({ state: 'done' }))).toBe(false);
  });
});

describe('sortNewestFirst', () => {
  it('puts the newest bubble first', () => {
    const older = bubble({ id: 'old', createdAt: '2026-08-20T10:00:00.000Z' });
    const newer = bubble({ id: 'new', createdAt: '2026-08-21T10:00:00.000Z' });
    expect(sortNewestFirst([older, newer]).map((b) => b.id)).toEqual(['new', 'old']);
  });

  it('does not mutate the input array', () => {
    const input = [
      bubble({ id: 'old', createdAt: '2026-08-20T10:00:00.000Z' }),
      bubble({ id: 'new', createdAt: '2026-08-21T10:00:00.000Z' }),
    ];
    sortNewestFirst(input);
    expect(input.map((b) => b.id)).toEqual(['old', 'new']);
  });
});
