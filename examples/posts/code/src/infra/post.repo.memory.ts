import type { Post } from '../domain/post.model.js';
import type { PostRepository } from '../domain/post.port.js';

export function createMemoryPostRepository(): PostRepository {
  const store = new Map<string, Post>();
  return {
    async save(post) {
      store.set(post.id, post);
    },
    async findById(id) {
      return store.get(id) ?? null;
    },
    async findAll() {
      return [...store.values()];
    },
    async remove(id) {
      return store.delete(id);
    },
  };
}
