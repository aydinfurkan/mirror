import express, { type Express } from 'express';
import type { ServiceDeps } from '../domain/post.service.js';
import { sendJson } from './http.js';
import { registerPostRoutes } from './routes/posts.route.js';

export function createServer(deps: ServiceDeps): Express {
  const app = express();
  app.use(express.json());
  app.get('/health', (_req, res) => {
    sendJson(res, 200, { status: 'ok' });
  });
  registerPostRoutes(app, deps);
  return app;
}
