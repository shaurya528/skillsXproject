import { authApi } from '@/lib/api/client';
import type { AuthUser } from './types';
import type { LoginValues, RegisterValues } from './schemas';

export const signIn = (values: LoginValues) =>
  authApi.post<{ user: AuthUser }>('/login', values);

export const signUp = (values: RegisterValues) =>
  authApi.post<{ user: AuthUser; loggedIn: boolean }>('/register', values);

export const signOut = () => authApi.post<void>('/logout');
