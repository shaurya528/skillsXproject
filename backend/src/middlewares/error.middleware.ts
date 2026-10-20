import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

// Runs when no route matched the URL
export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.notFound('Route not found'));
};

// Runs whenever an error is thrown anywhere
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Our own errors: use their status
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message },
    });
  }

  // Database trigger messages from your SQL
  const msg: string = err?.message ?? '';
  if (msg.includes('Team is full')) {
    return res.status(409).json({ error: { code: 'TEAM_FULL', message: msg } });
  }
  if (msg.includes('already a member')) {
    return res.status(409).json({ error: { code: 'ALREADY_MEMBER', message: msg } });
  }
  if (msg.includes('already been decided')) {
    return res.status(409).json({ error: { code: 'ALREADY_DECIDED', message: msg } });
  }

  // Anything unexpected
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong' } });
};