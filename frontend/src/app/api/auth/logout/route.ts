import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/server';
import { clearSessionCookies, readSessionCookies } from '@/lib/auth/cookies';
import { refreshSession } from '@/lib/auth/session';

export async function POST() {
  let { accessToken } = await readSessionCookies();
  const { refreshToken } = await readSessionCookies();

  // The access cookie lives about an hour. After that, renew it first,
  // otherwise the backend session would stay alive after "logout".
  if (!accessToken && refreshToken) {
    const result = await refreshSession(refreshToken);
    if (result.ok) accessToken = result.tokens.accessToken;
  }

  if (accessToken) {
    try {
      await backendFetch('/auth/logout', { method: 'POST', accessToken });
    } catch {
      // the backend being down must not stop someone from signing out here
    }
  }

  await clearSessionCookies();
  return new NextResponse(null, { status: 204 });
}
