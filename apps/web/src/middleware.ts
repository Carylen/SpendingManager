import { NextResponse, type NextRequest } from 'next/server';
import { viewerFromClaims } from '@/lib/auth/claims';
import { decideRoute } from '@/lib/auth/routes';
import { refreshSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response, claims } = await refreshSession(request);
  const decision = decideRoute(request.nextUrl.pathname, viewerFromClaims(claims));

  if (decision.type === 'allow') return response();
  if (decision.type === 'sign-out') await supabase.auth.signOut();

  const redirect = NextResponse.redirect(new URL(decision.to, request.url));
  response()
    .cookies.getAll()
    .forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)',
  ],
};
