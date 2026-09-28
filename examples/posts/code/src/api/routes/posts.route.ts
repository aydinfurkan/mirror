import type { Request, Response, Router } from 'express';
import {
  createPost,
  deletePost,
  getPost,
  listPosts,
  updatePost,
  type ServiceDeps,
  type ServiceResult,
} from '../../domain/post.service.js';
import { sendJson, sendNoContent, sendServiceError, sendUnexpectedError } from '../http.js';
import { parseCreatePostBody, parseUpdatePostBody } from './posts.schema.js';

function reply<T>(res: Response, status: number, result: ServiceResult<T>): void {
  if (result.ok) sendJson(res, status, result.value);
  else sendServiceError(res, result.error);
}

export async function handleCreatePost(deps: ServiceDeps, req: Request, res: Response): Promise<void> {
  const parsed = parseCreatePostBody(req.body);
  if (!parsed.ok) return sendServiceError(res, parsed.error);
  reply(res, 201, await createPost(deps, parsed.value));
}

export async function handleGetPost(deps: ServiceDeps, req: Request, res: Response): Promise<void> {
  reply(res, 200, await getPost(deps, String(req.params.id)));
}

export async function handleListPosts(deps: ServiceDeps, req: Request, res: Response): Promise<void> {
  const authorId = typeof req.query.authorId === 'string' ? req.query.authorId : undefined;
  reply(res, 200, await listPosts(deps, { authorId }));
}

export async function handleUpdatePost(deps: ServiceDeps, req: Request, res: Response): Promise<void> {
  const parsed = parseUpdatePostBody(req.body);
  if (!parsed.ok) return sendServiceError(res, parsed.error);
  reply(res, 200, await updatePost(deps, String(req.params.id), parsed.value));
}

export async function handleDeletePost(deps: ServiceDeps, req: Request, res: Response): Promise<void> {
  const result = await deletePost(deps, String(req.params.id));
  if (result.ok) sendNoContent(res);
  else sendServiceError(res, result.error);
}

export function registerPostRoutes(router: Router, deps: ServiceDeps): void {
  const handlers = [
    ['post', '/posts', handleCreatePost],
    ['get', '/posts', handleListPosts],
    ['get', '/posts/:id', handleGetPost],
    ['patch', '/posts/:id', handleUpdatePost],
    ['delete', '/posts/:id', handleDeletePost],
  ] as const;
  for (const [method, path, handler] of handlers) {
    router[method](path, (req, res) => {
      handler(deps, req, res).catch(() => sendUnexpectedError(res));
    });
  }
}
