'use client';

import { useState, useEffect, useCallback } from 'react';
import { SupabaseSaleRepository } from '@/infrastructure/repositories/SupabaseSaleRepository';
import { GetSalesByDateRangeUseCase } from '@/application/use-cases/getSalesByDateRange';
import { GetSalesSummary } from '@/app/use-cases/getSalesSummary';
import { SaleWithDetails, SalesSummary } from '@/domain/repositories/ISaleRepository';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatCurrency } from '@/utils/currency';
import { DateRange, DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Papa from 'papaparse';
import { SalesTrendChart } from '@/components/charts/SalesTrendChart';
import { TopProductsChart } from '@/components/charts/TopProductsChart';
import { Pagination } from '@/components/Pagination';

const saleRepository = new SupabaseSaleRepository();

export default function ReportesPage() {
  // State for the data being displayed in the list
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSales, setTotalSales] = useState(0);
  const ITEMS_PER_PAGE = 10;
  
  // State for summary cards
  const [summary, setSummary] = useState<SalesSummary>({ today: 0, month: 0 });
  
  // State for filters
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29); // Default to last 30 days
    return { from: startDate, to: endDate };
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);





  const loadSales = useCallback(async (currentRange: DateRange, search: string, page: number) => {
    if (currentRange?.from && currentRange?.to) {
      setLoading(true);
      const getSalesByDate = new GetSalesByDateRangeUseCase(saleRepository);
      try {
        const { sales: filteredSales, totalCount } = await getSalesByDate.execute(currentRange.from, currentRange.to, search, page, ITEMS_PER_PAGE);
        setSales(filteredSales);
        setTotalSales(totalCount);
      } catch (error) {
        console.error('Error fetching sales:', error);
        toast.error('No se pudieron cargar las ventas.');
      } finally {
        setLoading(false);
      }
    }
  }, []);

  // Effect to reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [range, searchTerm]);

  // Effect for loading sales based on filters and pagination
  useEffect(() => {
    if (range?.from && range?.to) {
      loadSales(range, searchTerm, currentPage);
    }
  }, [range, searchTerm, currentPage, loadSales]);

  // Effect for loading the sales summary
  useEffect(() => {
    const fetchSummary = async () => {
      const getSalesSummary = new GetSalesSummary(saleRepository);
      try {
        const summaryData = await getSalesSummary.execute();
        setSummary(summaryData);
      } catch (error) {
        console.error('Error fetching sales summary:', error);
        toast.error('No se pudo cargar el resumen de ventas.');
      }
    };

    fetchSummary();
  }, []);

  // The main useEffect now handles filtering automatically.
  // This handler is kept for the button's onClick, but it's technically redundant.
  // We can just rely on the state change to trigger the effect.
  const handleFilter = () => {
    if (!range?.from || !range?.to) {
      toast.info('Por favor, selecciona un rango de fechas completo.');
    }
    // The useEffect will handle the rest
  };

  const handleClearFilter = useCallback(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29);
    setRange({ from: startDate, to: endDate });
    setSearchTerm('');
    toast.success('Filtros reiniciados.');
  }, []);

  const handleExport = () => {
    if (sales.length === 0) {
      toast.error('No hay datos para exportar.');
      return;
    }

    const dataToExport = sales.flatMap((sale: SaleWithDetails) =>
      sale.sale_details.map((detail: SaleWithDetails['sale_details'][0]) => ({
        'ID Venta': sale.id,
        'Fecha': format(new Date(sale.created_at!), 'yyyy-MM-dd HH:mm:ss'),
        'Total Venta (S/)': sale.total,
        'ID Producto': detail.product_id,
        'Nombre Producto': detail.products?.name || 'N/A',
        'Cantidad': detail.quantity,
        'Precio Unitario (S/)': detail.price,
        'Subtotal (S/)': detail.quantity * detail.price,
      }))
    );

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
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
    <div className="flex flex-col md:flex-row gap-8 container mx-auto p-4 md:p-6 lg:p-8">
      {/* --- Left Sidebar (Controls) --- */}
      <aside className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Reportes</h1>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Controles</h2>
          
          <Link href="/" className="w-full text-center bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
            Volver al Inicio
          </Link>

          <input
            type="text"
            placeholder="Buscar por producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />

          <div>
            <h3 className="text-md font-semibold mb-2">Filtrar por Fecha</h3>
            <div className="transform scale-90 origin-top-left sm:scale-95 md:scale-100 transition-transform duration-200">
              <DayPicker
                mode="range"
                selected={range}
                onSelect={setRange}
                locale={es}
                className="border rounded-md p-2 bg-white"
                footer={
                  range?.from && range.to ? (
                    <p className="text-sm text-center mt-2">
                      Del {format(range.from, "PPP", { locale: es })} al {format(range.to, "PPP", { locale: es })}
                    </p>
                  ) : (
                    <p className="text-sm text-center mt-2">Selecciona un rango.</p>
                  )
                }
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <button 
              onClick={handleFilter} 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition-colors duration-200"
            >
              Aplicar Filtros
            </button>
            <button 
              onClick={handleClearFilter} 
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded shadow-md transition-colors duration-200"
            >
              Limpiar
            </button>
            <button 
              onClick={handleExport} 
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow-md transition-colors duration-200"
            >
              Exportar a CSV
            </button>
          </div>
        </div>
      </aside>

      {/* --- Right Content Area --- */}
      <main className="w-full md:w-2/3 lg:w-3/4">
        {/* Summary Cards */}
        {(summary.today > 0 || summary.month > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Ventas de Hoy</h2>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(summary.today)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Ventas del Mes</h2>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(summary.month)}</p>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {!loading && sales.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Tendencia de Ventas</h3>
              <SalesTrendChart sales={sales} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Top 5 Productos Más Vendidos</h3>
              <TopProductsChart sales={sales} />
            </div>
          </div>
        )}

        {/* Sales List Section */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No se encontraron ventas</h3>
            <p className="mt-1 text-sm text-gray-500">No hay ventas registradas para el criterio seleccionado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div key={sale.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
                <div 
                  className="flex justify-between items-center p-4 md:p-6 cursor-pointer"
                  onClick={() => setExpandedSaleId(expandedSaleId === sale.id ? null : sale.id)}
                >
                  <div className='flex-grow'>
                    <h2 className="text-lg md:text-xl font-semibold">Venta ID: {sale.id}</h2>
                    <p className="text-xs md:text-sm text-gray-500">
                      Fecha: {new Date(sale.created_at!).toLocaleString('es-PE')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4 ml-2">
                      <p className="text-lg md:text-2xl font-bold text-green-600 text-right">{formatCurrency(sale.total)}</p>
                      <svg className={`w-5 h-5 md:w-6 md:h-6 text-gray-500 transform transition-transform duration-300 ${expandedSaleId === sale.id ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                  </div>
                </div>
                
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedSaleId === sale.id ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-4 md:px-6 pb-4 md:pb-6">
                      <div className='border-t pt-4'>
                        <h3 className="font-semibold mb-2">Productos Vendidos:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm md:text-base">
                          {sale.sale_details.map((detail) => (
                            <li key={detail.id} className="text-gray-700">
                              {detail.products?.name || 'Producto no disponible'} - Cantidad: {detail.quantity} - Precio Unit.: {formatCurrency(detail.price)}
                            </li>
                          ))}
                        </ul>
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalSales > ITEMS_PER_PAGE && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalItems={totalSales}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </main>
    </div>
  );
}
