import { Request, Response, NextFunction } from 'express';
import { supabaseAnon } from '../config/supabase';
import { ApiError } from '../utils/apiError';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    const { data, error } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: { data: { name } }, // your trigger reads this
    });

    if (error) {
      if (error.code === 'user_already_exists' || error.message.includes('already registered')) {
        throw ApiError.conflict('Email already taken');
      }
      throw ApiError.badRequest(error.message);
    }

    res.status(201).json({
      user: { id: data.user!.id, email: data.user!.email, name },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    res.status(200).json({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name ?? '',
      },
    });
  } catch (err) {
    next(err);
  }
};