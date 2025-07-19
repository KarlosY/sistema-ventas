import type { Metadata } from 'next';
import { Toaster } from 'sonner';
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
      <body className="bg-gray-50 font-sans antialiased">
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}

