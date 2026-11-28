import { ApiError } from './errors';

type QueryValue = string | number | boolean | null | undefined | (string | number)[];
export type Query = Record<string, QueryValue>;

interface RequestOptions {
  query?: Query;
  body?: unknown;
  signal?: AbortSignal;
}

// { page: 2, skillIds: ['a','b'], q: '' } -> "?page=2&skillIds=a,b"
export function toQueryString(query: Query = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(','));
      continue;
    }
    params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : '';
}

// The session is gone: clear the cookies, then go to the login page
async function leaveToLogin() {
  const { pathname, search } = window.location;
  if (['/login', '/register', '/forgot-password'].includes(pathname)) return;

  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
  window.location.assign(`/login?next=${encodeURIComponent(pathname + search)}`);
}

function createClient(base: string, { redirectOnUnauthorized }: { redirectOnUnauthorized: boolean }) {
  async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const { query, body, signal } = options;

    let res: Response;
    try {
      res = await fetch(`${base}${path}${toQueryString(query)}`, {
        method,
        headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
      });
    } catch (error) {
      // a cancelled request is not a failure
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      throw new ApiError(0, 'NETWORK_ERROR', 'Network problem. Check your connection and try again.');
    }

    if (res.status === 204) return undefined as T;

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status === 401 && redirectOnUnauthorized) void leaveToLogin();
      throw new ApiError(
        res.status,
        data?.error?.code ?? 'UNKNOWN',
        data?.error?.message ?? 'Something went wrong. Please try again.'
      );
    }

    return data as T;
  }

  return {
    get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) => request<T>('GET', path, options),
    post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
      request<T>('POST', path, { ...options, body }),
    put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
      request<T>('PUT', path, { ...options, body }),
    patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
      request<T>('PATCH', path, { ...options, body }),
    delete: <T = void>(path: string, options?: Omit<RequestOptions, 'body'>) =>
      request<T>('DELETE', path, options),
  };
}

// For everything in your API: calls /api/backend/..., a lost session sends you to the login page
export const api = createClient('/api/backend', { redirectOnUnauthorized: true });

// For login, register and logout: calls /api/auth/..., a 401 here just means "wrong password"
export const authApi = createClient('/api/auth', { redirectOnUnauthorized: false });
