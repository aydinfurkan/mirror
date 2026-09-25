import express, { type Express } from 'express';
import type { ServiceDeps } from '../domain/bubble.service.js';
import { sendJson } from './http.js';
import { registerBubbleRoutes } from './routes/bubbles.route.js';

export function createServer(deps: ServiceDeps): Express {
  const app = express();
  app.use(express.json());
  app.get('/health', (_req, res) => {
    sendJson(res, 200, { status: 'ok' });
  });
  registerBubbleRoutes(app, deps);
  return app;
}
