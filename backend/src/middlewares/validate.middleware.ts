import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/apiError';

export const validate =
  (schema: ZodSchema, source: 'body' | 'query' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(source === 'body' ? req.body : req.query);

    if (!result.success) {
      const message = result.error.issues.map((i) => i.message).join(', ');
      return next(ApiError.badRequest(message));
    }

    if (source === 'body') {
      req.body = result.data;
    } else {
      res.locals.query = result.data; // cleaned query values
    }
    next();
  };