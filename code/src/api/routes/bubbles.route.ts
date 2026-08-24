import type { Request, Response, Router } from 'express';
import {
  completeBubble,
  createBubble,
  listBubblesByOwner,
  type ServiceDeps,
} from '../../domain/bubble.service.js';
import { sendJson, sendServiceError, sendUnexpectedError } from '../http.js';
import { parseCreateBubbleBody } from './bubbles.schema.js';

export async function postBubble(
  deps: ServiceDeps,
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = parseCreateBubbleBody(req.body);
  if (!parsed.ok) {
    sendServiceError(res, parsed.error);
    return;
  }
  const result = await createBubble(deps, parsed.value);
  if (!result.ok) {
    sendServiceError(res, result.error);
    return;
  }
  sendJson(res, 201, result.value);
}

export async function postBubbleComplete(
  deps: ServiceDeps,
  req: Request,
  res: Response,
): Promise<void> {
  const result = await completeBubble(deps, String(req.params.id));
  if (!result.ok) {
    sendServiceError(res, result.error);
    return;
  }
  sendJson(res, 200, result.value);
}

export async function getBubblesByOwner(
  deps: ServiceDeps,
  req: Request,
  res: Response,
): Promise<void> {
  const result = await listBubblesByOwner(deps, String(req.params.ownerId));
  if (!result.ok) {
    sendServiceError(res, result.error);
    return;
  }
  sendJson(res, 200, result.value);
}

export function registerBubbleRoutes(router: Router, deps: ServiceDeps): void {
  router.post('/bubbles', (req, res) => {
    postBubble(deps, req, res).catch(() => sendUnexpectedError(res));
  });
  router.post('/bubbles/:id/complete', (req, res) => {
    postBubbleComplete(deps, req, res).catch(() => sendUnexpectedError(res));
  });
  router.get('/owners/:ownerId/bubbles', (req, res) => {
    getBubblesByOwner(deps, req, res).catch(() => sendUnexpectedError(res));
  });
}
