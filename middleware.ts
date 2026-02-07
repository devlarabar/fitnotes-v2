import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('Middleware running for:', request.url);
  
  const allCookies = request.cookies.getAll();
  console.log('All cookies:', allCookies.map(c => c.name));
  
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll();
          console.log('Supabase getAll called, returning:', cookies.length, 'cookies');
          return cookies;
        },
        setAll(cookiesToSet) {
          console.log('Supabase setAll called with:', cookiesToSet.length, 'cookies');
          cookiesToSet.forEach(({ name, value, options }) => 
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  // Fallback: Check for manual cookies if session is null
  const hasManualCookies = request.cookies.has('sb-access-token');
  const hasSession = !!session || hasManualCookies;

  console.log('Session check:', { 
    hasSupabaseSession: !!session, 
    hasManualCookies, 
    finalAuthStatus: hasSession 
  });

  // Redirect to auth if not logged in
  if (!hasSession && !isAuthPage) {
    console.log('No session found, redirecting to /auth');
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Redirect to home if logged in and on auth page
  if (hasSession && isAuthPage) {
    console.log('Session found, redirecting to /');
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)']
};
