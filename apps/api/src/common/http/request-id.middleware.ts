import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

export function attachRequestId(
  req: Request & { requestId?: string },
  res: Response,
  next: NextFunction,
) {
  const headerRequestId = req.header('x-request-id');
  const requestId =
    typeof headerRequestId === 'string' && headerRequestId.length > 0
      ? headerRequestId
      : randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}
