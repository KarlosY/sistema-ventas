import { cookies } from 'next/headers';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { verifyToken } from '@/infrastructure/auth/jwt';

export default async function Navbar() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  let user: { email: string; role: string; fullName: string } | null = null;

  if (token) {
    try {
      const decoded = verifyToken(token);
      user = {
        email: decoded.email,
        role: decoded.role,
        fullName: decoded.fullName
      };
    } catch (error) {
      user = null;
    }
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Mi Tienda
            </Link>
            {user && (
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link href="/ventas" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Ventas</Link>
                  {user.role === 'Administrador' && (
                    <>
                      <Link href="/productos" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Productos</Link>
                      <Link href="/reportes" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Reportes</Link>
                      <Link href="/registro" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Registrar Usuario</Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <div className="flex items-center space-x-4">
                    <span className="text-gray-600 text-sm">Hola, {user.email}</span>
                    <LogoutButton />
                </div>
              ) : (
                <Link href="/login" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Iniciar Sesión</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
