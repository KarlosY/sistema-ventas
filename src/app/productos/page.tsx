'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/domain/entities/Product';
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';
import { GetAllProductsUseCase } from '@/application/use-cases/getAllProducts';
import { CreateProductUseCase } from '@/application/use-cases/createProduct';
import { UpdateProductUseCase } from '@/application/use-cases/updateProduct';
import { DeleteProductUseCase } from '@/application/use-cases/deleteProduct';
import ProductForm from '@/components/ProductForm';

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  // Instanciamos el repositorio y los casos de uso
  const productRepository = new SupabaseProductRepository();
  const getAllProducts = new GetAllProductsUseCase(productRepository);
  const createProduct = new CreateProductUseCase(productRepository);
  const updateProduct = new UpdateProductUseCase(productRepository);
  const deleteProduct = new DeleteProductUseCase(productRepository);

  const loadProducts = async () => {
    const productsData = await getAllProducts.execute();
    setProducts(productsData);
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

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      await deleteProduct.execute(id);
      loadProducts(); // Recargamos la lista
    }
  };

  const handleSave = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    if (editingProduct) {
      await updateProduct.execute(editingProduct.id, productData);
    } else {
      await createProduct.execute(productData);
    }
    loadProducts(); // Recargamos la lista
    setIsFormVisible(false);
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <button onClick={handleCreate} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Crear Producto
        </button>
      </div>

      {isFormVisible && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={() => setIsFormVisible(false)}
        />
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Listado de Productos</h2>
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
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="px-5 py-4 text-sm bg-white">{product.name}</td>
                  <td className="px-5 py-4 text-sm bg-white">${product.price.toFixed(2)}</td>
                  <td className="px-5 py-4 text-sm bg-white">{product.stock}</td>
                  <td className="px-5 py-4 text-sm bg-white">
                    <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    No hay productos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
