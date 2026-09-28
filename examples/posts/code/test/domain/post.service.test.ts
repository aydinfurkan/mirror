import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_BODY_LENGTH, MAX_TITLE_LENGTH } from '../../src/domain/post.rules.js';
import {
  createPost,
  deletePost,
  getPost,
  listPosts,
  updatePost,
  type ServiceDeps,
} from '../../src/domain/post.service.js';
import { createMemoryPostRepository } from '../../src/infra/post.repo.memory.js';

let deps: ServiceDeps;

beforeEach(() => {
  let clock = Date.UTC(2026, 8, 25, 10, 0, 0);
  let counter = 0;
  deps = {
    repo: createMemoryPostRepository(),
    now: () => new Date((clock += 1000)).toISOString(),
    newId: () => `p${++counter}`,
  };
});

const input = { title: 'Hello', body: 'First post.', authorId: 'u1' };

describe('createPost', () => {
  it('creates and stores a post', async () => {
    const result = await createPost(deps, input);
    expect(result).toEqual({
      ok: true,
      value: {
        id: 'p1',
        ...input,
        createdAt: '2026-09-25T10:00:01.000Z',
        updatedAt: '2026-09-25T10:00:01.000Z',
      },
    });
    expect(await deps.repo.findById('p1')).not.toBeNull();
  });

  it.each([
    ['title', { ...input, title: '  ' }, 'Enter a title.'],
    ['title', { ...input, title: 'x'.repeat(MAX_TITLE_LENGTH + 1) }, 'Use 120 characters or fewer in the title.'],
    ['body', { ...input, body: '' }, 'Enter a body.'],
    ['body', { ...input, body: 'x'.repeat(MAX_BODY_LENGTH + 1) }, 'Use 10000 characters or fewer in the body.'],
  ])('rejects an invalid %s and stores nothing', async (field, bad, message) => {
    const result = await createPost(deps, bad);
    expect(result).toEqual({ ok: false, error: { code: 'validation', field, message } });
    expect(await deps.repo.findAll()).toEqual([]);
  });

  it('accepts a title of exactly 120 characters', async () => {
    const result = await createPost(deps, { ...input, title: 'x'.repeat(MAX_TITLE_LENGTH) });
    expect(result.ok).toBe(true);
  });
});

describe('getPost', () => {
  it('returns the post', async () => {
    await createPost(deps, input);
    const result = await getPost(deps, 'p1');
    expect(result.ok && result.value.title).toBe('Hello');
  });

  it('reports a missing post', async () => {
    expect(await getPost(deps, 'nope')).toEqual({
      ok: false,
      error: { code: 'not-found', field: 'id', message: 'Find no post with this id.' },
    });
  });
});

describe('listPosts', () => {
  beforeEach(async () => {
    await createPost(deps, { ...input, title: 'First' });
    await createPost(deps, { ...input, title: 'Second' });
    await createPost(deps, { ...input, title: 'Theirs', authorId: 'u2' });
  });

  it('returns all posts, newest first', async () => {
    const result = await listPosts(deps, {});
    expect(result.ok && result.value.map((p) => p.title)).toEqual(['Theirs', 'Second', 'First']);
  });

  it('returns only the posts of one author', async () => {
    const result = await listPosts(deps, { authorId: 'u1' });
    expect(result.ok && result.value.map((p) => p.title)).toEqual(['Second', 'First']);
  });

  it('returns an empty list for an author with no posts', async () => {
    expect(await listPosts(deps, { authorId: 'u9' })).toEqual({ ok: true, value: [] });
  });
});

describe('updatePost', () => {
  it('changes only the given fields and records the update time', async () => {
    await createPost(deps, input);
    const result = await updatePost(deps, 'p1', { title: 'Renamed' });
    expect(result).toEqual({
      ok: true,
      value: {
        id: 'p1',
        ...input,
        title: 'Renamed',
        createdAt: '2026-09-25T10:00:01.000Z',
        updatedAt: '2026-09-25T10:00:02.000Z',
      },
    });
  });

  it('rejects an invalid field and keeps the post', async () => {
    await createPost(deps, input);
    const result = await updatePost(deps, 'p1', { body: ' ' });
    expect(result).toEqual({ ok: false, error: { code: 'validation', field: 'body', message: 'Enter a body.' } });
    expect((await deps.repo.findById('p1'))?.body).toBe('First post.');
  });

  it('reports a missing post', async () => {
    const result = await updatePost(deps, 'nope', { title: 'x' });
    expect(result.ok || result.error.code).toBe('not-found');
  });
});

describe('deletePost', () => {
  it('removes the post', async () => {
    await createPost(deps, input);
    expect(await deletePost(deps, 'p1')).toEqual({ ok: true, value: null });
    expect(await deps.repo.findById('p1')).toBeNull();
  });

  it('reports a missing post', async () => {
    const result = await deletePost(deps, 'nope');
    expect(result.ok || result.error.code).toBe('not-found');
  });
});
