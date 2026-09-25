import type { Post } from './post.model.js';

export interface PostRepository {
  save(post: Post): Promise<void>;
  findById(id: string): Promise<Post | null>;
  findAll(): Promise<Post[]>;
  remove(id: string): Promise<boolean>;
}
