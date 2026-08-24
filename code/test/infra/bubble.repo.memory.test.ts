import { describe, expect, it } from 'vitest';
import type { Bubble } from '../../src/domain/bubble.model.js';
import { createMemoryBubbleRepository } from '../../src/infra/bubble.repo.memory.js';

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

describe('createMemoryBubbleRepository', () => {
  it('returns null for an unknown id', async () => {
    const repo = createMemoryBubbleRepository();
    expect(await repo.findById('nope')).toBeNull();
  });

  it('saves and reads a bubble back', async () => {
    const repo = createMemoryBubbleRepository();
    await repo.save(bubble());
    expect(await repo.findById('b1')).toEqual(bubble());
  });

  it('overwrites a bubble that has the same id', async () => {
    const repo = createMemoryBubbleRepository();
    await repo.save(bubble());
    await repo.save(bubble({ state: 'done' }));
    const found = await repo.findById('b1');
    expect(found?.state).toBe('done');
  });

  it('filters by owner', async () => {
    const repo = createMemoryBubbleRepository();
    await repo.save(bubble({ id: 'b1', ownerId: 'u1' }));
    await repo.save(bubble({ id: 'b2', ownerId: 'u2' }));
    const owned = await repo.findByOwner('u1');
    expect(owned.map((b) => b.id)).toEqual(['b1']);
  });

  it('gives each repository its own store', async () => {
    const first = createMemoryBubbleRepository();
    const second = createMemoryBubbleRepository();
    await first.save(bubble());
    expect(await second.findById('b1')).toBeNull();
  });
});
