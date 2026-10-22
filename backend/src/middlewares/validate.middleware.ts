
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiError } from '../utils/apiError';

export const validate =
  (schema: z.ZodType) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join(', ');

      next(ApiError.badRequest(message));
      return;
    }

    req.body = result.data;
    next();
  };
