import type { Express } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createServer } from '../../../src/api/server.js';
import type { ServiceDeps } from '../../../src/domain/post.service.js';
import { createMemoryPostRepository } from '../../../src/infra/post.repo.memory.js';

let deps: ServiceDeps;
let app: Express;

beforeEach(() => {
  let clock = Date.UTC(2026, 8, 25, 10, 0, 0);
  let counter = 0;
  deps = {
    repo: createMemoryPostRepository(),
    now: () => new Date((clock += 1000)).toISOString(),
    newId: () => `p${++counter}`,
  };
  app = createServer(deps);
});

const input = { title: 'Hello', body: 'First post.', authorId: 'u1' };

describe('POST /posts', () => {
  it('creates a post and returns 201', async () => {
    const res = await request(app).post('/posts').send(input);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 'p1', ...input });
  });

  it('returns 400 when authorId is missing', async () => {
    const res = await request(app).post('/posts').send({ title: 'Hello', body: 'Hi' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatchObject({ code: 'validation', field: 'authorId' });
  });

  it('returns 400 when the title is empty', async () => {
    const res = await request(app).post('/posts').send({ ...input, title: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toEqual({ code: 'validation', field: 'title', message: 'Enter a title.' });
  });
});

describe('GET /posts/:id', () => {
  it('returns the post', async () => {
    await request(app).post('/posts').send(input);
    const res = await request(app).get('/posts/p1');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Hello');
  });

  it('returns 404 for an unknown post', async () => {
    const res = await request(app).get('/posts/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('not-found');
  });
});

describe('GET /posts', () => {
  it('lists posts newest first and filters by author', async () => {
    await request(app).post('/posts').send({ ...input, title: 'First' });
    await request(app).post('/posts').send({ ...input, title: 'Theirs', authorId: 'u2' });
    const all = await request(app).get('/posts');
    const mine = await request(app).get('/posts?authorId=u1');
    expect(all.body.map((p: { title: string }) => p.title)).toEqual(['Theirs', 'First']);
    expect(mine.body.map((p: { title: string }) => p.title)).toEqual(['First']);
  });
});

describe('PATCH /posts/:id', () => {
  it('updates the post', async () => {
    await request(app).post('/posts').send(input);
    const res = await request(app).patch('/posts/p1').send({ body: 'Edited.' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ title: 'Hello', body: 'Edited.', updatedAt: '2026-09-25T10:00:02.000Z' });
  });

  it('returns 400 when the body has no field to change', async () => {
    await request(app).post('/posts').send(input);
    const res = await request(app).patch('/posts/p1').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation');
  });

  it('returns 404 for an unknown post', async () => {
    const res = await request(app).patch('/posts/nope').send({ title: 'x' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /posts/:id', () => {
  it('deletes the post and returns 204', async () => {
    await request(app).post('/posts').send(input);
    const res = await request(app).delete('/posts/p1');
    expect(res.status).toBe(204);
    expect((await request(app).get('/posts/p1')).status).toBe(404);
  });

  it('returns 404 for an unknown post', async () => {
    const res = await request(app).delete('/posts/nope');
    expect(res.status).toBe(404);
  });
});

describe('GET /health', () => {
  it('reports that the service is up', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('unexpected failures', () => {
  it('answers with 500 when the repository throws', async () => {
    const fail = async () => {
      throw new Error('disk on fire');
    };
    const broken = createServer({ ...deps, repo: { save: fail, findById: fail, findAll: fail, remove: fail } });
    const res = await request(broken).get('/posts');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('unexpected');
  });
});
