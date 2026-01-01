import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    // Solo redirigir a login si no estamos ya en login
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  try {
    // Usar versión compatible con Edge Runtime
    const { verifyTokenEdge } = await import('./infrastructure/auth/jwt-edge');
    const decoded = await verifyTokenEdge(token);
    
    // Si el usuario está autenticado y trata de acceder a /login, redirigir a home
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);
    requestHeaders.set('x-user-email', decoded.email);

    // Protección de rutas de administrador
    const adminRoutes = ['/productos', '/reportes', '/registro'];
    if (decoded.role !== 'Administrador' && adminRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Error en middleware:', error);
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
