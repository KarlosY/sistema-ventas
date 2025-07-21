'use client';

import { useState, useEffect } from 'react';
import { SupabaseSaleRepository } from '@/infrastructure/repositories/SupabaseSaleRepository';
import { GetAllSalesUseCase } from '@/application/use-cases/getAllSales';
import { SaleWithDetails } from '@/domain/repositories/ISaleRepository';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ReportesPage() {
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      const saleRepository = new SupabaseSaleRepository();
      const getAllSales = new GetAllSalesUseCase(saleRepository);
      try {
        const salesData = await getAllSales.execute();
        setSales(salesData);
      } catch (error) {
        console.error('Error fetching sales reports:', error);
        toast.error('No se pudieron cargar los reportes de ventas.');
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reporte de Ventas</h1>
        <Link href="/" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
          Volver al Inicio
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No hay ventas registradas</h3>
          <p className="mt-1 text-sm text-gray-500">Parece que aún no se ha completado ninguna venta. ¡Ve a la sección de ventas para registrar la primera!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sales.map((sale) => (
            <div key={sale.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                                    <h2 className="text-xl font-semibold">Venta ID: {sale.id}</h2>
                  <p className="text-sm text-gray-500">
                    Fecha: {new Date(sale.created_at!).toLocaleString()}
                  </p>
                </div>
                <p className="text-2xl font-bold text-green-600">${sale.total.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Productos Vendidos:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {sale.sale_details.map((detail) => (
                    <li key={detail.id} className="text-gray-700">
                      {detail.products?.name || 'Producto no disponible'} - Cantidad: {detail.quantity} - Precio Unit.: ${detail.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
