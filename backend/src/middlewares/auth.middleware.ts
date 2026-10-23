import { Request, Response, NextFunction } from 'express';
import { supabaseAnon, supabaseForUser } from '../config/supabase';
import { ApiError } from '../utils/apiError';

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Missing token');
    }

    const token = header.slice(7);

   
    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data.user) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    req.user = data.user;
    req.token = token;
    req.supabase = supabaseForUser(token); // RLS + triggers now see this user

    next();
  } catch (err) {
    next(err);
  }
};