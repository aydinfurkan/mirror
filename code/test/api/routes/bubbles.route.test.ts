import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ServiceDeps } from '../../../src/domain/bubble.service.js';
import { createMemoryBubbleRepository } from '../../../src/infra/bubble.repo.memory.js';
import { createServer } from '../../../src/api/server.js';

let deps: ServiceDeps;
let app: express.Express;

beforeEach(() => {
  let clock = Date.UTC(2026, 7, 21, 10, 0, 0);
  let counter = 0;
  deps = {
    repo: createMemoryBubbleRepository(),
    now: () => new Date((clock += 1000)).toISOString(),
    newId: () => `b${++counter}`,
  };
  app = createServer(deps);
});

describe('POST /bubbles', () => {
  it('creates a bubble and returns 201', async () => {
    const res = await request(app).post('/bubbles').send({ title: 'Ship it', ownerId: 'u1' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 'b1',
      title: 'Ship it',
      ownerId: 'u1',
      state: 'open',
      createdAt: '2026-08-21T10:00:01.000Z',
      completedAt: null,
    });
  });

  it('returns 400 when the title is empty', async () => {
    const res = await request(app).post('/bubbles').send({ title: '', ownerId: 'u1' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: { code: 'validation', field: 'title', message: 'Enter a title.' },
    });
  });

  it('returns 400 when ownerId is missing', async () => {
    const res = await request(app).post('/bubbles').send({ title: 'Ship it' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation');
    expect(res.body.error.field).toBe('ownerId');
  });
});

describe('POST /bubbles/:id/complete', () => {
  it('completes an open bubble', async () => {
    await request(app).post('/bubbles').send({ title: 'Ship it', ownerId: 'u1' });
    const res = await request(app).post('/bubbles/b1/complete').send();
    expect(res.status).toBe(200);
    expect(res.body.state).toBe('done');
  });

  it('returns 404 for an unknown bubble', async () => {
    const res = await request(app).post('/bubbles/nope/complete').send();
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('not-found');
  });

  it('returns 409 when the bubble is already done', async () => {
    await request(app).post('/bubbles').send({ title: 'Ship it', ownerId: 'u1' });
    await request(app).post('/bubbles/b1/complete').send();
    const res = await request(app).post('/bubbles/b1/complete').send();
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('conflict');
  });
});

describe('GET /owners/:ownerId/bubbles', () => {
  it('lists the bubbles of the owner, newest first', async () => {
    await request(app).post('/bubbles').send({ title: 'First', ownerId: 'u1' });
    await request(app).post('/bubbles').send({ title: 'Second', ownerId: 'u1' });
    await request(app).post('/bubbles').send({ title: 'Theirs', ownerId: 'u2' });
    const res = await request(app).get('/owners/u1/bubbles');
    expect(res.status).toBe(200);
    expect(res.body.map((b: { title: string }) => b.title)).toEqual(['Second', 'First']);
  });
});

describe('GET /health', () => {
  it('reports that the service is up', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
