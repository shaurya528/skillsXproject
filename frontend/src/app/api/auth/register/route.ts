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
  if (typeof body !== 'object' || body === null) {
    return jsonError(400, 'BAD_REQUEST', 'Invalid request body');
  }
  const { email, password } = body as { email?: string; password?: string };

  try {
    const registered = await backendFetch('/auth/register', { method: 'POST', body });
    if (!registered.ok) return relayError(registered);
    const { user } = await registered.json();

    // Sign in straight away, so the new person lands inside the app
    const login = await backendFetch('/auth/login', { method: 'POST', body: { email, password } });
    if (!login.ok) {
      return NextResponse.json({ user, loggedIn: false }, { status: 201 });
    }

    await setSessionCookies(await login.json());
    return NextResponse.json({ user, loggedIn: true }, { status: 201 });
  } catch {
    return jsonError(502, 'BACKEND_UNAVAILABLE', 'Cannot reach the server. Please try again.');
  }
}
