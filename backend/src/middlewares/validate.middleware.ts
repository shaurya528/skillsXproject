
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiError } from '../utils/apiError';

type Source = 'body' | 'query' | 'params';

export const validate =
  (schema: z.ZodType, source: Source = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join(', ');

      return next(ApiError.badRequest(message));
    }

    if (source === 'body') {
      req.body = result.data;
    } else {
      res.locals[source] = result.data;
    }

    next();
  };
