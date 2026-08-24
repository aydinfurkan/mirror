import type { Response } from 'express';
import type { ServiceError } from '../domain/bubble.service.js';

const STATUS_BY_CODE: Record<ServiceError['code'], number> = {
  validation: 400,
  'not-found': 404,
  conflict: 409,
};

export function sendJson(res: Response, status: number, body: unknown): void {
  res.status(status).json(body);
}

export function sendServiceError(res: Response, error: ServiceError): void {
  sendJson(res, STATUS_BY_CODE[error.code], { error });
}

export function sendUnexpectedError(res: Response): void {
  sendJson(res, 500, {
    error: {
      code: 'unexpected',
      field: 'server',
      message: 'The server failed to handle the request.',
    },
  });
}
