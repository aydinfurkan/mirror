import { randomUUID } from 'node:crypto';
import type { BubbleRepository } from '../domain/bubble.port.js';
import type { ServiceDeps } from '../domain/bubble.service.js';

export function createSystemDeps(repo: BubbleRepository): ServiceDeps {
  return {
    repo,
    now: () => new Date().toISOString(),
    newId: () => randomUUID(),
  };
}
