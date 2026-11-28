import { NextResponse } from 'next/server';
import { backendForward, jsonError } from '@/lib/api/server';
import {
  clearSessionCookies,
  readSessionCookies,
  setSessionCookies,
  type Tokens,
} from '@/lib/auth/cookies';
import { refreshSession } from '@/lib/auth/session';

type Context = { params: Promise<{ path: string[] }> };

// Letters, digits, - and _ only: ids, words and names like "required-skills"
const SEGMENT = /^[A-Za-z0-9_-]+$/;
const PUBLIC_AUTH_PATH = 'auth/password-reset-requests';

// A browser POST from another website sends a different Origin
function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true; // curl and server calls send none
  try {
    return new URL(origin).host === request.headers.get('host');
  } catch {
    return false;
  }
}

// Get new tokens, store them in the cookies, or explain why that is not possible
async function renew(
  refreshToken: string
): Promise<{ tokens: Tokens; error?: never } | { error: NextResponse; tokens?: never }> {
  const result = await refreshSession(refreshToken);

  if (result.ok) {
    await setSessionCookies(result.tokens);
    return { tokens: result.tokens };
  }
  if (result.reason === 'invalid') {
    await clearSessionCookies();
    return { error: jsonError(401, 'SESSION_EXPIRED', 'Please sign in again') };
  }
  return { error: jsonError(502, 'BACKEND_UNAVAILABLE', 'Cannot reach the server. Please try again.') };
}

function relay(res: Response) {
  if (res.status === 204 || res.status === 304) {
    return new NextResponse(null, { status: res.status });
  }
  const headers = new Headers({ 'cache-control': 'no-store' });
  const type = res.headers.get('content-type');
  if (type) headers.set('content-type', type);
  return new NextResponse(res.body, { status: res.status, headers });
}

async function handle(request: Request, { params }: Context) {
  const { path } = await params;

  if (!path.every((segment) => SEGMENT.test(segment))) {
    return jsonError(400, 'BAD_REQUEST', 'Invalid path');
  }
  const joined = path.join('/');

  // Auth calls carry tokens, so they must only go through our own handlers
  if (joined === 'auth' || (joined.startsWith('auth/') && joined !== PUBLIC_AUTH_PATH)) {
    return jsonError(404, 'NOT_FOUND', 'Route not found');
  }

  const method = request.method;
  if (method !== 'GET' && !isSameOrigin(request)) {
    return jsonError(403, 'FORBIDDEN', 'Cross-site request blocked');
  }

  const target = `/${joined}${new URL(request.url).search}`;
  const body = method === 'GET' ? undefined : await request.arrayBuffer();
  const contentType = request.headers.get('content-type');

  let { accessToken, refreshToken } = await readSessionCookies();
  let refreshed = false;

  // The access cookie has expired, but the refresh cookie is still alive
  if (!accessToken && refreshToken) {
    const renewed = await renew(refreshToken);
    if (renewed.error) return renewed.error;
    accessToken = renewed.tokens.accessToken;
    refreshToken = renewed.tokens.refreshToken;
    refreshed = true;
  }

  try {
    let res = await backendForward(target, { method, body, contentType, accessToken });

    // The backend refused the token (for example the session was ended):
    // refresh once and try again
    if (res.status === 401 && refreshToken && !refreshed) {
      const renewed = await renew(refreshToken);
      if (renewed.error) return renewed.error;
      res = await backendForward(target, {
        method,
        body,
        contentType,
        accessToken: renewed.tokens.accessToken,
      });
    }

    return relay(res);
  } catch {
    return jsonError(502, 'BACKEND_UNAVAILABLE', 'Cannot reach the server. Please try again.');
  }
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
