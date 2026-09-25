import { z } from 'zod';
import type { CreatePostInput, ServiceError, UpdatePostInput } from '../../domain/post.service.js';

const createPostBody = z.object({
  title: z.string(),
  body: z.string(),
  authorId: z.string().min(1),
});

const updatePostBody = z
  .object({ title: z.string().optional(), body: z.string().optional() })
  .refine((value) => value.title !== undefined || value.body !== undefined, { path: ['body'] });

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: ServiceError };

function parse<T>(schema: z.ZodType<T>, input: unknown, message: string): ParseResult<T> {
  const parsed = schema.safeParse(input);
  if (parsed.success) return { ok: true, value: parsed.data };
  const first = parsed.error.issues[0];
  return { ok: false, error: { code: 'validation', field: String(first?.path[0] ?? 'body'), message } };
}

export function parseCreatePostBody(input: unknown): ParseResult<CreatePostInput> {
  return parse(createPostBody, input, 'Send a title string, a body string and a non-empty authorId string.');
}

export function parseUpdatePostBody(input: unknown): ParseResult<UpdatePostInput> {
  return parse(updatePostBody, input, 'Send a title string, a body string, or both.');
}
