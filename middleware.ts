import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { updateSupabaseSession } from './lib/supabase/middleware';

const handleI18nRouting = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 1. Refresh Supabase auth session (keeps cookies valid)
  const { response, user } = await updateSupabaseSession(request);

  // 2. Apply next-intl locale routing on top
  const intlResponse = handleI18nRouting(request);

  // Merge cookies set by Supabase into the response next-intl returns
  response.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  // 3. Guard: /[locale]/dashboard and /[locale]/admin require auth
  const pathname = request.nextUrl.pathname;
  const isDashboard = /^\/(az|en)\/dashboard/.test(pathname);
  const isAdmin = /^\/(az|en)\/admin/.test(pathname);

  if ((isDashboard || isAdmin) && !user) {
    const locale = pathname.split('/')[1] || routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return intlResponse;
}

export const config = {
  matcher: [
    // Skip static files, images, api routes that don't need locale
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
