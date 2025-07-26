import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();

  let userRole: string | null = null;
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    userRole = profile?.role ?? null;
  }

  return (
    <div className="text-center mt-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Bienvenido al Sistema de Ventas</h1>
      <p className="text-lg text-gray-600 mb-8">Selecciona una opción para comenzar</p>
      <nav className="flex flex-wrap justify-center gap-4">
        {userRole === 'Administrador' && (
          <>
            <Link href="/productos" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
              Gestionar Productos
            </Link>
            <Link href="/reportes" className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors">
              Ver Reportes
            </Link>
            <Link href="/registro" className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors">
              Registrar Usuario
            </Link>
          </>
        )}
        {session && (
          <Link href="/ventas" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors">
            Registrar Venta
          </Link>
        )}
      </nav>
    </div>
  );
}


