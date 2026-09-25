import type { Bubble } from './bubble.model.js';

export interface BubbleRepository {
  save(bubble: Bubble): Promise<void>;
  findById(id: string): Promise<Bubble | null>;
  findByOwner(ownerId: string): Promise<Bubble[]>;
}
