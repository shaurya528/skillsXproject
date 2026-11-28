import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth/constants';

const AUTH_PAGES = ['/login', '/register', '/forgot-password'];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(REFRESH_COOKIE) || request.cookies.has(ACCESS_COOKIE);
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Logged out, asking for a private page: go to login and remember where
  if (!hasSession && !isAuthPage) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }

  // Already logged in, asking for the login page: go to the dashboard
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Only these URLs pass through the guard. Home, /design and /api stay untouched.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/projects/:path*',
    '/talent/:path*',
    '/users/:path*',
    '/applications/:path*',
    '/invitations/:path*',
    '/notifications/:path*',
    '/settings/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};
