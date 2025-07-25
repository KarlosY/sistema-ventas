'use client';

import { useState } from 'react';
import { Product } from '@/domain/entities/Product';
import { Category } from '@/domain/entities/Category';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Omit<Product, 'id' | 'created_at' | 'categories'>) => void;
  onCancel: () => void;
  categories: Category[];
}

export default function ProductForm({ product, onSave, onCancel, categories }: ProductFormProps) {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [stock, setStock] = useState(product?.stock.toString() || '');
  const [categoryId, setCategoryId] = useState<string>(product?.category_id?.toString() || '');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [errors, setErrors] = useState<{ name?: string; price?: string; stock?: string; category?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; price?: string; stock?: string; category?: string } = {};

    if (!name.trim()) newErrors.name = 'El nombre es obligatorio.';
    else if (!/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s-]+$/.test(name)) newErrors.name = 'El nombre no debe contener caracteres especiales.';

    if (!price) newErrors.price = 'El precio es obligatorio.';
    else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) newErrors.price = 'El precio debe ser un número positivo.';

    if (!stock) newErrors.stock = 'El stock es obligatorio.';
    else if (isNaN(parseInt(stock, 10)) || parseInt(stock, 10) < 0 || !Number.isInteger(parseFloat(stock))) newErrors.stock = 'El stock debe ser un número entero no negativo.';

    if (categoryId === 'new' && !newCategoryName.trim()) newErrors.category = 'El nombre de la nueva categoría es obligatorio.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        name,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        category_id: categoryId === 'new' ? null : parseInt(categoryId, 10),
        // Pasamos el nombre de la nueva categoría para que el padre la cree
        // @ts-ignore
        newCategoryName: categoryId === 'new' ? newCategoryName : undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          {product ? 'Editar Producto' : 'Crear Nuevo Producto'}
        </h3>
        <form onSubmit={handleSubmit}>
          {/* Name, Price, Stock inputs ... (igual que antes) */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio</label>
            <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
            <input type="number" id="stock" value={stock} onChange={(e) => setStock(e.target.value)} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.stock ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} />
            {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            >
              <option value="">Seleccione una categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
              ))}
              <option value="new">--- Crear Nueva Categoría ---</option>
            </select>
            {categoryId === 'new' && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Nombre de la nueva categoría"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
              Cancelar
            </button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
