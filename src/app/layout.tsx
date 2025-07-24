import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import Navbar from '@/components/Navbar'; // Importar el Navbar
import './globals.css';

export const metadata: Metadata = {
  title: 'Sistema de Ventas',
  description: 'Aplicación para gestionar ventas, productos y reportes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="application-name" content="Sistema de Ventas" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ventas" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#007BFF" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png"></link>
      </head>
      <body className="bg-gray-50 font-sans antialiased">
        <Navbar /> {/* Añadir el Navbar aquí */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <Toaster richColors />
      </body>
    </html>
  );
}

