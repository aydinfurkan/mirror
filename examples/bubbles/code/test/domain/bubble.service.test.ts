import { beforeEach, describe, expect, it } from 'vitest';
import type { Bubble } from '../../src/domain/bubble.model.js';
import type { BubbleRepository } from '../../src/domain/bubble.port.js';
import {
  completeBubble,
  createBubble,
  listBubblesByOwner,
  type ServiceDeps,
} from '../../src/domain/bubble.service.js';

function fakeRepo(seed: Bubble[] = []): BubbleRepository {
  const store = new Map(seed.map((b) => [b.id, b]));
  return {
    async save(bubble) {
      store.set(bubble.id, bubble);
    },
    async findById(id) {
      return store.get(id) ?? null;
    },
    async findByOwner(ownerId) {
      return [...store.values()].filter((b) => b.ownerId === ownerId);
    },
  };
}

let deps: ServiceDeps;
let clock: number;
let counter: number;

beforeEach(() => {
  clock = Date.UTC(2026, 7, 21, 10, 0, 0);
  counter = 0;
  deps = {
    repo: fakeRepo(),
    now: () => new Date((clock += 1000)).toISOString(),
    newId: () => `b${++counter}`,
  };
});

describe('createBubble', () => {
  it('creates an open bubble', async () => {
    const result = await createBubble(deps, { title: 'Ship it', ownerId: 'u1' });
    expect(result).toEqual({
      ok: true,
      value: {
        id: 'b1',
        title: 'Ship it',
        ownerId: 'u1',
        state: 'open',
        createdAt: '2026-08-21T10:00:01.000Z',
        completedAt: null,
      },
    });
  });

  it('stores the bubble', async () => {
    await createBubble(deps, { title: 'Ship it', ownerId: 'u1' });
    expect(await deps.repo.findById('b1')).not.toBeNull();
  });

  it('rejects an invalid title and stores nothing', async () => {
    const result = await createBubble(deps, { title: '  ', ownerId: 'u1' });
    expect(result).toEqual({
      ok: false,
      error: { code: 'validation', field: 'title', message: 'Enter a title.' },
    });
    expect(await deps.repo.findById('b1')).toBeNull();
  });
});

describe('completeBubble', () => {
  it('marks an open bubble as done', async () => {
    const created = await createBubble(deps, { title: 'Ship it', ownerId: 'u1' });
    if (!created.ok) throw new Error('setup failed');
    const result = await completeBubble(deps, created.value.id);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.state).toBe('done');
    expect(result.value.completedAt).toBe('2026-08-21T10:00:02.000Z');
  });

  it('reports a missing bubble', async () => {
    const result = await completeBubble(deps, 'nope');
    expect(result).toEqual({
      ok: false,
      error: { code: 'not-found', field: 'id', message: 'Find no bubble with this id.' },
    });
  });

  it('refuses to complete a bubble twice', async () => {
    const created = await createBubble(deps, { title: 'Ship it', ownerId: 'u1' });
    if (!created.ok) throw new Error('setup failed');
    await completeBubble(deps, created.value.id);
    const second = await completeBubble(deps, created.value.id);
    expect(second).toEqual({
      ok: false,
      error: { code: 'conflict', field: 'state', message: 'This bubble is already done.' },
    });
  });
});

describe('listBubblesByOwner', () => {
  it('returns the newest bubble first', async () => {
    await createBubble(deps, { title: 'First', ownerId: 'u1' });
    await createBubble(deps, { title: 'Second', ownerId: 'u1' });
    const result = await listBubblesByOwner(deps, 'u1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((b) => b.title)).toEqual(['Second', 'First']);
  });

  it('excludes the bubbles of another owner', async () => {
    await createBubble(deps, { title: 'Mine', ownerId: 'u1' });
    await createBubble(deps, { title: 'Theirs', ownerId: 'u2' });
    const result = await listBubblesByOwner(deps, 'u1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((b) => b.title)).toEqual(['Mine']);
  });
});
