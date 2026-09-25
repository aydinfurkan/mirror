import type { Post } from './post.model.js';
import type { PostRepository } from './post.port.js';
import { sortNewestFirst, validateBody, validateTitle } from './post.rules.js';

export interface ServiceDeps {
  repo: PostRepository;
  now(): string;
  newId(): string;
}

export interface CreatePostInput {
  title: string;
  body: string;
  authorId: string;
}

export interface UpdatePostInput {
  title?: string;
  body?: string;
}

export interface ListPostsQuery {
  authorId?: string;
}

export interface ServiceError {
  code: 'validation' | 'not-found';
  field: string;
  message: string;
}

export type ServiceResult<T> = { ok: true; value: T } | { ok: false; error: ServiceError };

const NOT_FOUND: ServiceError = { code: 'not-found', field: 'id', message: 'Find no post with this id.' };

function validate(input: UpdatePostInput): ServiceError | null {
  const invalid =
    (input.title !== undefined && validateTitle(input.title)) ||
    (input.body !== undefined && validateBody(input.body)) ||
    null;
  return invalid && { code: 'validation', ...invalid };
}

export async function createPost(deps: ServiceDeps, input: CreatePostInput): Promise<ServiceResult<Post>> {
  const error = validate(input);
  if (error) return { ok: false, error };
  const now = deps.now();
  const post: Post = { id: deps.newId(), ...input, createdAt: now, updatedAt: now };
  await deps.repo.save(post);
  return { ok: true, value: post };
}

export async function getPost(deps: ServiceDeps, id: string): Promise<ServiceResult<Post>> {
  const post = await deps.repo.findById(id);
  return post ? { ok: true, value: post } : { ok: false, error: NOT_FOUND };
}

export async function listPosts(deps: ServiceDeps, query: ListPostsQuery): Promise<ServiceResult<Post[]>> {
  const all = await deps.repo.findAll();
  const matching = query.authorId ? all.filter((post) => post.authorId === query.authorId) : all;
  return { ok: true, value: sortNewestFirst(matching) };
}

export async function updatePost(
  deps: ServiceDeps,
  id: string,
  input: UpdatePostInput,
): Promise<ServiceResult<Post>> {
  const found = await deps.repo.findById(id);
  if (!found) return { ok: false, error: NOT_FOUND };
  const error = validate(input);
  if (error) return { ok: false, error };
  const updated: Post = {
    ...found,
    title: input.title ?? found.title,
    body: input.body ?? found.body,
    updatedAt: deps.now(),
  };
  await deps.repo.save(updated);
  return { ok: true, value: updated };
}

export async function deletePost(deps: ServiceDeps, id: string): Promise<ServiceResult<null>> {
  return (await deps.repo.remove(id)) ? { ok: true, value: null } : { ok: false, error: NOT_FOUND };
}
