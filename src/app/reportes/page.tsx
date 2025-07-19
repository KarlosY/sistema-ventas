'use client';

import { useState, useEffect } from 'react';
import { SupabaseSaleRepository } from '@/infrastructure/repositories/SupabaseSaleRepository';
import { GetAllSalesUseCase } from '@/application/use-cases/getAllSales';
import { SaleWithDetails } from '@/domain/repositories/ISaleRepository';

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
        alert('No se pudieron cargar los reportes de ventas.');
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Reporte de Ventas</h1>

      {loading ? (
        <p>Cargando reportes...</p>
      ) : sales.length === 0 ? (
        <p className="text-gray-500">No hay ventas registradas todavía.</p>
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
