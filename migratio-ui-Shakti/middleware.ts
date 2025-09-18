import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    pathname === '/' ||
    pathname.startsWith('/auth/login') ||
    pathname.startsWith('/auth/register') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Supabase sets a cookie named 'sb-access-token' (or 'sb:token' for legacy)
  // We'll check for the presence of the main Supabase auth cookie
  const hasSupabaseCookie =
    request.cookies.has('sb-access-token') ||
    request.cookies.has('supabase-auth-token') ||
    request.cookies.has('sb:token');

  if (!hasSupabaseCookie) {
    // Not authenticated, redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated, continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}; 