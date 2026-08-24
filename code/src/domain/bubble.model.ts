export type BubbleState = 'open' | 'done';

export interface Bubble {
  id: string;
  title: string;
  ownerId: string;
  state: BubbleState;
  createdAt: string;
  completedAt: string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}
