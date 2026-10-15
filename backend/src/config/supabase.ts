import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

const options = { auth: { persistSession: false, autoRefreshToken: false } };

// 1) For login / register (there is no logged-in user yet)
export const supabaseAnon = createClient(env.supabaseUrl, env.supabaseAnonKey, options);

// 2) For normal requests: acts as the logged-in user, so RLS applies
export const supabaseForUser = (token: string): SupabaseClient =>
  createClient(env.supabaseUrl, env.supabaseAnonKey, {
    ...options,
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

// 3) Admin: bypasses all security rules. Use very rarely.
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceKey, options);