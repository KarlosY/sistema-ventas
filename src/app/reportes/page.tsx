'use client';

import { useState, useEffect, useCallback } from 'react';
import { SupabaseSaleRepository } from '@/infrastructure/repositories/SupabaseSaleRepository';
import { GetAllSalesUseCase } from '@/application/use-cases/getAllSales';
import { GetSalesByDateRangeUseCase } from '@/application/use-cases/getSalesByDateRange';
import { SaleWithDetails } from '@/domain/repositories/ISaleRepository';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatCurrency } from '@/utils/currency';
import { DateRange, DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Papa from 'papaparse';

const saleRepository = new SupabaseSaleRepository();

export default function ReportesPage() {
  // State for the data being displayed in the list
  const [displayedSales, setDisplayedSales] = useState<SaleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  // State for the summary cards, calculated once on initial load
  const [salesToday, setSalesToday] = useState(0);
  const [salesThisMonth, setSalesThisMonth] = useState(0);
  
  // State for the date picker UI
  const [range, setRange] = useState<DateRange | undefined>();

  const calculateSummaries = (sales: SaleWithDetails[]) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const todaySales = sales
      .filter(sale => {
        const saleDate = new Date(sale.created_at!);
        return saleDate.getDate() === today.getDate() &&
               saleDate.getMonth() === currentMonth &&
               saleDate.getFullYear() === currentYear;
      })
      .reduce((total, sale) => total + sale.total, 0);

    const monthSales = sales
      .filter(sale => {
        const saleDate = new Date(sale.created_at!);
        return saleDate.getMonth() === currentMonth &&
               saleDate.getFullYear() === currentYear;
      })
      .reduce((total, sale) => total + sale.total, 0);

    setSalesToday(todaySales);
    setSalesThisMonth(monthSales);
  };

  // Initial data fetch for summaries and initial view
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const getAllSales = new GetAllSalesUseCase(saleRepository);
      try {
        const allSales = await getAllSales.execute();
        setDisplayedSales(allSales);
        calculateSummaries(allSales);
      } catch (error) {
        console.error('Error fetching initial sales reports:', error);
        toast.error('No se pudieron cargar los reportes de ventas.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleFilter = useCallback(async () => {
    if (range?.from && range?.to) {
      setIsFiltering(true);
      const getSalesByDate = new GetSalesByDateRangeUseCase(saleRepository);
      try {
        const filtered = await getSalesByDate.execute(range.from, range.to);
        setDisplayedSales(filtered);
        toast.success(`Mostrando ${filtered.length} ventas encontradas.`);
      } catch (error) {
        console.error('Error fetching filtered sales:', error);
        toast.error('No se pudieron filtrar las ventas.');
      } finally {
        setIsFiltering(false);
      }
    } else {
      toast.info('Por favor, selecciona un rango de fechas completo.');
    }
  }, [range]);

  const handleClearFilter = useCallback(async () => {
    setIsFiltering(true);
    const getAllSales = new GetAllSalesUseCase(saleRepository);
    try {
      const allSales = await getAllSales.execute();
      setDisplayedSales(allSales);
      setRange(undefined);
      toast.info('Filtro de fechas limpiado.');
    } catch (error) {
      console.error('Error fetching sales after clearing filter:', error);
      toast.error('No se pudieron recargar las ventas.');
    } finally {
      setIsFiltering(false);
    }
  }, []);

  const handleExport = () => {
    if (displayedSales.length === 0) {
      toast.error('No hay datos para exportar.');
      return;
    }

    const dataToExport = displayedSales.flatMap(sale => 
      sale.sale_details.map(detail => ({
        'ID Venta': sale.id,
        'Fecha': new Date(sale.created_at!).toLocaleString('es-PE'),
        'Total Venta (S/)': sale.total.toFixed(2),
        'ID Producto': detail.product_id,
        'Producto': detail.products?.name || 'N/A',
        'Cantidad': detail.quantity,
        'Precio Unit. (S/)': detail.price.toFixed(2),
        'Subtotal (S/)': (detail.quantity * detail.price).toFixed(2),
      }))
    );

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_ventas_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Reporte exportado a CSV exitosamente.');
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reporte de Ventas</h1>
        <Link href="/" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
          Volver al Inicio
        </Link>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-8">
        <h3 className="font-semibold mb-4">Filtrar por Fecha</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              locale={es}
              className="bg-white p-2 rounded-md shadow-lg"
              footer={
                <p className='text-center text-sm p-2'>
                  {range?.from && range.to ? 
                    `Del ${format(range.from, 'dd LLL yyyy', { locale: es })} al ${format(range.to, 'dd LLL yyyy', { locale: es })}` :
                    'Por favor, selecciona un rango de fechas.'
                  }
                </p>
              }
            />
          </div>
          <button onClick={handleFilter} disabled={isFiltering || !range?.from || !range?.to} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
            {isFiltering ? 'Filtrando...' : 'Filtrar'}
          </button>
          <button onClick={handleClearFilter} disabled={isFiltering} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
            {isFiltering ? 'Cargando...' : 'Limpiar'}
          </button>
          <button onClick={handleExport} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ml-auto">
            Exportar a CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Ventas de Hoy</h2>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(salesToday)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Ventas del Mes</h2>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(salesThisMonth)}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      ) : displayedSales.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No se encontraron ventas</h3>
          <p className="mt-1 text-sm text-gray-500">No hay ventas registradas para el criterio seleccionado o no hay ventas en general.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedSales.map((sale) => (
            <div key={sale.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Venta ID: {sale.id}</h2>
                  <p className="text-sm text-gray-500">
                    Fecha: {new Date(sale.created_at!).toLocaleString('es-PE')}
                  </p>
                </div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(sale.total)}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Productos Vendidos:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {sale.sale_details.map((detail) => (
                    <li key={detail.id} className="text-gray-700">
                      {detail.products?.name || 'Producto no disponible'} - Cantidad: {detail.quantity} - Precio Unit.: {formatCurrency(detail.price)}
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
