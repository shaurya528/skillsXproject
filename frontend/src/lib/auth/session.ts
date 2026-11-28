import 'server-only';
import { backendFetch } from '@/lib/api/server';
import type { Tokens } from './cookies';

export type RefreshResult =
  | { ok: true; tokens: Tokens }
  | { ok: false; reason: 'invalid' | 'unavailable' };

// Refresh tokens work once. When several requests need a refresh at the same
// moment, they must share ONE refresh, and requests that arrive a moment later
// with the old token must get the same answer.
const REUSE_MS = 15_000;
const recent = new Map<string, Promise<RefreshResult>>();

export function refreshSession(refreshToken: string): Promise<RefreshResult> {
  const existing = recent.get(refreshToken);
  if (existing) return existing;

  const promise = (async (): Promise<RefreshResult> => {
    try {
      const res = await backendFetch('/auth/refresh', { method: 'POST', body: { refreshToken } });
      if (res.ok) return { ok: true, tokens: (await res.json()) as Tokens };
      // A refused token is "invalid". A backend problem or rate limit is only "unavailable".
      return { ok: false, reason: res.status >= 500 || res.status === 429 ? 'unavailable' : 'invalid' };
    } catch {
      return { ok: false, reason: 'unavailable' };
    }
  })();

  recent.set(refreshToken, promise);
  promise.then((result) => {
    if (!result.ok) recent.delete(refreshToken); // never remember a failure
  });
  setTimeout(() => recent.delete(refreshToken), REUSE_MS);

  return promise;
}
