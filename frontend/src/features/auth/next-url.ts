const AUTH_PAGES = ['/login', '/register', '/forgot-password'];

// After login we go back to the page the person wanted, but ONLY if it is a page
// on this site. Without this check, a link like /login?next=https://evil.com
// would send people to another website right after they log in.
export function getSafeNext(next: string | null | undefined, fallback = '/dashboard') {
  if (!next) return fallback;
  if (!next.startsWith('/')) return fallback; // not a path on this site
  if (next.startsWith('//')) return fallback; // "//evil.com" means another website
  if (next.includes('\\')) return fallback; // browsers read "\" like "/"
  if (AUTH_PAGES.some((page) => next === page || next.startsWith(`${page}?`))) return fallback; // no loops
  return next;
}
