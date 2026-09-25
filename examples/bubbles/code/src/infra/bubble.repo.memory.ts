import type { Bubble } from '../domain/bubble.model.js';
import type { BubbleRepository } from '../domain/bubble.port.js';

export function createMemoryBubbleRepository(): BubbleRepository {
  const store = new Map<string, Bubble>();
  return {
    async save(bubble) {
      store.set(bubble.id, bubble);
    },
    async findById(id) {
      return store.get(id) ?? null;
    },
    async findByOwner(ownerId) {
      return [...store.values()].filter((bubble) => bubble.ownerId === ownerId);
    },
  };
}
