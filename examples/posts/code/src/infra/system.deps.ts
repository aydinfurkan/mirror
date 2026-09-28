import { randomUUID } from 'node:crypto';
import type { PostRepository } from '../domain/post.port.js';
import type { ServiceDeps } from '../domain/post.service.js';

export function createSystemDeps(repo: PostRepository): ServiceDeps {
  return {
    repo,
    now: () => new Date().toISOString(),
    newId: () => randomUUID(),
  };
}
