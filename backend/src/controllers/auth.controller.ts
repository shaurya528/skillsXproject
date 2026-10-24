import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { supabaseAnon, supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';

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
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabaseAnon.auth.refreshSession({
      refresh_token: req.body.refreshToken,
    });

    if (error || !data.session) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    res.status(200).json({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabaseAdmin.auth.admin.signOut(req.token!, 'local');
    if (error) throw ApiError.badRequest(error.message);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabaseAnon.auth.resetPasswordForEmail(req.body.email, {
      redirectTo: `${env.corsOrigin}/reset-password`,
    });

    if (error) console.error('Password reset error:', error.message);

    res.status(202).send();
  } catch (err) {
    next(err);
  }
};