import { z } from 'zod';
import type { CreateBubbleInput, ServiceError } from '../../domain/bubble.service.js';

const createBubbleBody = z.object({
  title: z.string(),
  ownerId: z.string().min(1),
});

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: ServiceError };

export function parseCreateBubbleBody(body: unknown): ParseResult<CreateBubbleInput> {
  const parsed = createBubbleBody.safeParse(body);
  if (parsed.success) {
    return { ok: true, value: parsed.data };
  }
  const first = parsed.error.issues[0];
  return {
    ok: false,
    error: {
      code: 'validation',
      field: String(first?.path[0] ?? 'body'),
      message: 'Send a title string and a non-empty ownerId string.',
    },
  };
}
