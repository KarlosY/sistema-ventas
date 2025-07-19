import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Sistema de Ventas</h1>
        <p className="text-lg text-gray-600 mb-8">Selecciona una opción para comenzar</p>
        <nav className="flex flex-wrap justify-center gap-4">
          <Link href="/productos" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            Gestionar Productos
          </Link>
          <Link href="/ventas" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors">
            Registrar Venta
          </Link>
          <Link href="/reportes" className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors">
            Ver Reportes
          </Link>
        </nav>
      </div>
    </main>
  );
}

