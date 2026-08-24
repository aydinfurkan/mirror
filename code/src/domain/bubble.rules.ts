import type { Bubble, ValidationError } from './bubble.model.js';

export const MAX_TITLE_LENGTH = 120;

export function validateTitle(title: string): ValidationError | null {
  if (title.trim().length === 0) {
    return { field: 'title', message: 'Enter a title.' };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return {
      field: 'title',
      message: `Use ${MAX_TITLE_LENGTH} characters or fewer in the title.`,
    };
  }
  return null;
}

export function isCompletable(bubble: Bubble): boolean {
  return bubble.state === 'open';
}

export function sortNewestFirst(bubbles: Bubble[]): Bubble[] {
  return [...bubbles].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
