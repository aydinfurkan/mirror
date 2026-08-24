import type { Bubble } from './bubble.model.js';
import type { BubbleRepository } from './bubble.port.js';
import { isCompletable, sortNewestFirst, validateTitle } from './bubble.rules.js';

export interface ServiceDeps {
  repo: BubbleRepository;
  now(): string;
  newId(): string;
}

export interface CreateBubbleInput {
  title: string;
  ownerId: string;
}

export interface ServiceError {
  code: 'validation' | 'not-found' | 'conflict';
  field: string;
  message: string;
}

export type ServiceResult<T> = { ok: true; value: T } | { ok: false; error: ServiceError };

export async function createBubble(
  deps: ServiceDeps,
  input: CreateBubbleInput,
): Promise<ServiceResult<Bubble>> {
  const invalid = validateTitle(input.title);
  if (invalid) {
    return { ok: false, error: { code: 'validation', ...invalid } };
  }
  const bubble: Bubble = {
    id: deps.newId(),
    title: input.title,
    ownerId: input.ownerId,
    state: 'open',
    createdAt: deps.now(),
    completedAt: null,
  };
  await deps.repo.save(bubble);
  return { ok: true, value: bubble };
}

export async function completeBubble(
  deps: ServiceDeps,
  id: string,
): Promise<ServiceResult<Bubble>> {
  const found = await deps.repo.findById(id);
  if (!found) {
    return {
      ok: false,
      error: { code: 'not-found', field: 'id', message: 'Find no bubble with this id.' },
    };
  }
  if (!isCompletable(found)) {
    return {
      ok: false,
      error: { code: 'conflict', field: 'state', message: 'This bubble is already done.' },
    };
  }
  const completed: Bubble = { ...found, state: 'done', completedAt: deps.now() };
  await deps.repo.save(completed);
  return { ok: true, value: completed };
}

export async function listBubblesByOwner(
  deps: ServiceDeps,
  ownerId: string,
): Promise<ServiceResult<Bubble[]>> {
  const owned = await deps.repo.findByOwner(ownerId);
  return { ok: true, value: sortNewestFirst(owned) };
}
