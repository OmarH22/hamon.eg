import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/admin-auth';

/**
 * Gate in front of everything private. The admin pages and the CSV export also
 * re-check the session themselves, so a middleware misconfiguration cannot
 * expose data on its own.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = await verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);

  if (pathname === '/admin/login') {
    if (!authenticated) return NextResponse.next();
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  if (!authenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/export'],
};
