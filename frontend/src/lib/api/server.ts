import 'server-only';
import { NextResponse } from 'next/server';

export function backendUrl(path: string) {
  const base = process.env.API_URL;
  if (!base) throw new Error('API_URL is not set. Add it to frontend/.env.local');
  return `${base}${path}`;
}

interface BackendInit {
  method?: string;
  body?: unknown;
  accessToken?: string;
}

// Call the Express API from the Next.js server
export function backendFetch(path: string, { method = 'GET', body, accessToken }: BackendInit = {}) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  return fetch(backendUrl(path), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
}

// An error in the same { error: { code, message } } shape the backend uses
export const jsonError = (status: number, code: string, message: string) =>
  NextResponse.json({ error: { code, message } }, { status });

// Pass the backend's own error through to the browser
export async function relayError(res: Response) {
  const data = await res.json().catch(() => null);
  if (data?.error?.message) return NextResponse.json(data, { status: res.status });
  return jsonError(res.status, 'UPSTREAM_ERROR', 'Something went wrong');
}

interface ForwardInit {
  method: string;
  body?: ArrayBuffer;
  contentType?: string | null;
  accessToken?: string;
}

// Pass a browser request on to Express unchanged (path and query included)
export function backendForward(
  pathWithQuery: string,
  { method, body, contentType, accessToken }: ForwardInit
) {
  const hasBody = body !== undefined && body.byteLength > 0;
  const headers: Record<string, string> = {};
  if (hasBody && contentType) headers['Content-Type'] = contentType;
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  return fetch(backendUrl(pathWithQuery), {
    method,
    headers,
    body: hasBody ? body : undefined,
    cache: 'no-store',
  });
}
