import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pages publiques sans protection : /, /gps, /gps/*, /auth/*
  const isPublicPath = 
    pathname === '/' || 
    pathname.startsWith('/gps') || 
    pathname.startsWith('/auth');

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Protéger les routes : /dashboard/*, /expeditions/*, /admin
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/expeditions') || 
    pathname.startsWith('/admin');

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Récupérer le token de session et le rôle de l'utilisateur stockés dans les cookies
  const userSessionToken = request.cookies.get('sb-access-token')?.value || request.cookies.get('user_id')?.value;
  const userRole = request.cookies.get('user_role')?.value?.toUpperCase();

  // Si non connecté et accès à /dashboard/* ou /expeditions/* ou /admin → rediriger vers /auth/connexion
  if (!userSessionToken) {
    const loginUrl = new URL('/auth/connexion', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si connecté avec rôle CLIENT et accès à /dashboard/gp/* ou /admin → rediriger vers /dashboard/client
  if (userRole === 'CLIENT') {
    if (pathname.startsWith('/dashboard/gp') || pathname.startsWith('/admin')) {
      const clientDashboardUrl = new URL('/dashboard/client', request.url);
      return NextResponse.redirect(clientDashboardUrl);
    }
  }

  // Si connecté avec rôle GP et accès à /dashboard/client → rediriger vers /dashboard/gp
  if (userRole === 'GP') {
    if (pathname === '/dashboard/client' || pathname.startsWith('/dashboard/client')) {
      const gpDashboardUrl = new URL('/dashboard/gp', request.url);
      return NextResponse.redirect(gpDashboardUrl);
    }
  }

  // Si connecté avec rôle ADMIN → accès à tout (déjà géré car ne matche pas les redirections ci-dessus)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/expeditions/:path*',
    '/admin/:path*',
  ],
};
