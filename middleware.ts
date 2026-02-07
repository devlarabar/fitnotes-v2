import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const hasAuthCookie = request.cookies.has('sb-access-token') || 
    request.cookies.has('sb-refresh-token');

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  // Redirect to auth if no session and trying to access protected routes
  if (!hasAuthCookie && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Redirect to home if has session and trying to access auth page
  if (hasAuthCookie && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)']
};
