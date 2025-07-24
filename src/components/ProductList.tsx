'use client';

import { Product } from '@/domain/entities/Product';
import { formatCurrency } from '@/utils/currency';
import { Pagination } from './Pagination';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  searchTerm: string;
  totalProducts: number;
  currentPage: number;
  itemsPerPage: number;
  onSearchTermChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export default function ProductList({ 
  products, 
  loading, 
  searchTerm, 
  totalProducts, 
  currentPage, 
  itemsPerPage, 
  onSearchTermChange, 
  onPageChange, 
  onEdit, 
  onDelete 
}: ProductListProps) {
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar producto por nombre..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando productos...</p>
        </div>
      ) : (
        <div className="shadow-lg rounded-lg overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm">
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Nombre</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Categoría</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Precio</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Stock</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="px-5 py-4 text-sm bg-white">{product.name}</td>
                  <td className="px-5 py-4 text-sm bg-white text-gray-600">{product.categories?.name || <span className='italic'>Sin categoría</span>}</td>
                  <td className="px-5 py-4 text-sm bg-white">{formatCurrency(product.price)}</td>
                  <td className="px-5 py-4 text-sm bg-white">{product.stock}</td>
                  <td className="px-5 py-4 text-sm bg-white">
                    <button onClick={() => onEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                    <button onClick={() => onDelete(product.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && !loading && (
                <tr>
                  <td colSpan={5}>
                    <div className="text-center py-20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No hay productos</h3>
                      <p className="mt-1 text-sm text-gray-500">Crea un nuevo producto para empezar a gestionar tu inventario.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalItems={totalProducts}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
