import 'server-only';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, REFRESH_COOKIE } from './constants';

const base = {
  httpOnly: true, // JavaScript in the page can never read these
  sameSite: 'lax' as const, // not sent on cross-site POST requests
  secure: process.env.NODE_ENV === 'production', // HTTPS only when deployed
  path: '/',
};

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export async function setSessionCookies(tokens: Tokens) {
  const jar = await cookies();
  // The browser drops the access cookie 30s before the token really expires,
  // so we refresh in good time instead of sending a token that is about to fail
  jar.set(ACCESS_COOKIE, tokens.accessToken, {
    ...base,
    maxAge: Math.max(tokens.expiresIn - 30, 60),
  });
  jar.set(REFRESH_COOKIE, tokens.refreshToken, { ...base, maxAge: 60 * 60 * 24 * 30 });
}

export async function clearSessionCookies() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function readSessionCookies() {
  const jar = await cookies();
  return {
    accessToken: jar.get(ACCESS_COOKIE)?.value,
    refreshToken: jar.get(REFRESH_COOKIE)?.value,
  };
}
