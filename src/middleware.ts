import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Si el usuario no está autenticado y no está en la página de login, redirigir a login
  if (!session && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Si el usuario está autenticado y trata de acceder a la página de login, redirigir al inicio
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Lógica de protección de rutas basada en roles
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const userRole = profile?.role;

    // Rutas solo para administradores
    const adminRoutes = ['/productos', '/reportes', '/registro'];

    if (userRole !== 'Administrador' && adminRoutes.some(route => pathname.startsWith(route))) {
        // Si un no-administrador intenta acceder a una ruta de admin, redirigir al inicio
        return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
}

// Configuración del matcher para especificar qué rutas deben ser protegidas por el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /auth/callback (Supabase auth callback)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
};
