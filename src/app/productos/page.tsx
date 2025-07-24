'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/domain/entities/Product';
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';
import { GetAllProductsUseCase } from '@/application/use-cases/getAllProducts';
import { CreateProductUseCase } from '@/application/use-cases/createProduct';
import { UpdateProductUseCase } from '@/application/use-cases/updateProduct';
import { DeleteProductUseCase } from '@/application/use-cases/deleteProduct';
import ProductForm from '@/components/ProductForm';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatCurrency } from '@/utils/currency';

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Instanciamos el repositorio y los casos de uso
  const productRepository = new SupabaseProductRepository();
  const getAllProducts = new GetAllProductsUseCase(productRepository);
  const createProduct = new CreateProductUseCase(productRepository);
  const updateProduct = new UpdateProductUseCase(productRepository);
  const deleteProduct = new DeleteProductUseCase(productRepository);

    const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getAllProducts.execute();
      setProducts(productsData);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreate = () => {
    setEditingProduct(undefined);
    setIsFormVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormVisible(true);
  };

  const handleDelete = (id: number) => {
    toast("¿Estás seguro de que quieres eliminar este producto?", {
      action: {
        label: "Eliminar",
        onClick: async () => {
          try {
            await deleteProduct.execute(id);
            toast.success("Producto eliminado exitosamente");
            loadProducts(); // Recargamos la lista
          } catch (error) {
            toast.error("No se pudo eliminar el producto");
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
    });
  };

    const handleSave = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    try {
      const isEditing = !!editingProduct;
      if (isEditing) {
        await updateProduct.execute(editingProduct.id, productData);
        toast.success("Producto actualizado exitosamente");
      } else {
        await createProduct.execute(productData);
        toast.success("Producto creado exitosamente");
      }
      loadProducts(); // Recargamos la lista
      setIsFormVisible(false);
    } catch (error) {
      const action = editingProduct ? 'actualizar' : 'crear';
      toast.error(`No se pudo ${action} el producto`);
      console.error(`Error saving product:`, error);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);


  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <div>
          <Link href="/" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-3">
            Volver al Inicio
          </Link>
          <button onClick={handleCreate} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Crear Producto
          </button>
        </div>
      </div>

      {isFormVisible && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={() => setIsFormVisible(false)}
        />
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      ) : (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Listado de Productos</h2>
        
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar producto por nombre..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset page when searching
            }}
            className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm">
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Nombre</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Precio</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Stock</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="px-5 py-4 text-sm bg-white">{product.name}</td>
                  <td className="px-5 py-4 text-sm bg-white">{formatCurrency(product.price)}</td>
                  <td className="px-5 py-4 text-sm bg-white">{product.stock}</td>
                  <td className="px-5 py-4 text-sm bg-white">
                    <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && !loading && (
                <tr>
                  <td colSpan={4}>
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
