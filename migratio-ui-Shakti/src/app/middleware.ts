import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, redirect to login
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Check if user is deactivated
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('status, deactivated_at, reactivation_requested_at')
      .eq('id', session.user.id)
      .single();

    if (error) {
      // If we can't fetch profile, allow the request to continue
      return res;
    }

    if (profile) {
      // If user is deactivated or has requested reactivation, redirect to deactivated page
      if (profile.status === 'deactivated' || profile.status === 'reactivation_requested') {
        const url = req.nextUrl.clone();
        url.pathname = '/deactivated';
        return NextResponse.redirect(url);
      }
    }
  } catch {
    // Silent error handling
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth folder (login/register pages)
     * - deactivated page
     */
    '/((?!_next/static|_next/image|favicon.ico|public|auth|deactivated).*)',
  ],
}; 