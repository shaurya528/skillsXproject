import { NextResponse } from 'next/server';
import { backendFetch, jsonError, relayError } from '@/lib/api/server';
import { setSessionCookies } from '@/lib/auth/cookies';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'BAD_REQUEST', 'Invalid request body');
  }

  try {
    const res = await backendFetch('/auth/login', { method: 'POST', body });
    if (!res.ok) return relayError(res);

    const data = await res.json();
    await setSessionCookies(data);

    // The tokens stay in cookies. The browser only gets the user.
    return NextResponse.json({ user: data.user });
  } catch {
    return jsonError(502, 'BACKEND_UNAVAILABLE', 'Cannot reach the server. Please try again.');
  }
}
