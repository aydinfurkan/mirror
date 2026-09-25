import type { Post, ValidationError } from './post.model.js';

export const MAX_TITLE_LENGTH = 120;
export const MAX_BODY_LENGTH = 10_000;

export function validateTitle(title: string): ValidationError | null {
  if (title.trim().length === 0) {
    return { field: 'title', message: 'Enter a title.' };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { field: 'title', message: `Use ${MAX_TITLE_LENGTH} characters or fewer in the title.` };
  }
  return null;
}

export function validateBody(body: string): ValidationError | null {
  if (body.trim().length === 0) {
    return { field: 'body', message: 'Enter a body.' };
  }
  if (body.length > MAX_BODY_LENGTH) {
    return { field: 'body', message: `Use ${MAX_BODY_LENGTH} characters or fewer in the body.` };
  }
  return null;
}

export function sortNewestFirst(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
