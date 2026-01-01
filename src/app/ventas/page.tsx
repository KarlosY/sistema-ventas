'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/domain/entities/Product';
import { Category } from '@/domain/entities/Category';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatCurrency } from '@/utils/currency';

export interface CartItem extends Product {
  quantity: number;
}

function VentasComponent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/products?limit=1000'),
          fetch('/api/categories'),
        ]);
        const { products: productsData } = await productsResponse.json();
        const categoriesData = await categoriesResponse.json();
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("No se pudieron cargar los datos iniciales.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddProduct = () => {
    if (!selectedProductId) return;

    const productIdAsNumber = parseInt(selectedProductId, 10);

    const productToAdd = products.find(p => p.id === productIdAsNumber);
    if (!productToAdd) return;

    const existingCartItem = cart.find(item => item.id === productIdAsNumber);
    const currentQuantityInCart = existingCartItem ? existingCartItem.quantity : 0;

    if (currentQuantityInCart >= productToAdd.stock) {
      toast.warning(`No puedes añadir más de ${productToAdd.stock} unidades de "${productToAdd.name}", que es el stock disponible.`);
      return;
    }

    if (existingCartItem) {
      // Incrementar cantidad si ya existe
      setCart(cart.map(item => 
        item.id === productIdAsNumber ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      // Añadir nuevo producto al carrito
      setCart([...cart, { ...productToAdd, quantity: 1 }]);
    }
    setSelectedProductId(''); // Resetear el selector
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    const productInProductsList = products.find(p => p.id === productId);
    if (!productInProductsList) return;

    if (newQuantity > productInProductsList.stock) {
      toast.warning(`Stock máximo (${productInProductsList.stock}) alcanzado para "${productInProductsList.name}".`);
      return;
    }

    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const filteredProducts = useMemo(() => {
    if (!selectedCategoryId) {
      return products;
    }
    return products.filter(p => p.category_id?.toString() === selectedCategoryId);
  }, [products, selectedCategoryId]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleRegisterSale = async () => {
    if (cart.length === 0) return;

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart })
      });
      
      if (!response.ok) throw new Error('Error al registrar venta');
      
      toast.success(`Venta registrada exitosamente por un total de: ${formatCurrency(total)}`);
      setCart([]);
      
      // Recargar productos para reflejar nuevo stock
      const productsResponse = await fetch('/api/products?limit=1000');
      const { products: productsData } = await productsResponse.json();
      setProducts(productsData);
    } catch (error) {
      toast.error(`Error al registrar la venta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Registrar Venta</h1>
        <Link href="/" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
          Volver al Inicio
        </Link>
      </div>

      {/* Sección para agregar productos */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Añadir Producto</h2>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedCategoryId}
                onChange={e => setSelectedCategoryId(e.target.value)}
                className="block w-full sm:w-1/3 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select 
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="block w-full sm:w-2/3 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              >
                <option value="">Seleccione un producto</option>
                {filteredProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatCurrency(p.price)}) - Stock: {p.stock}
                  </option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleAddProduct}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 sm:mt-0 sm:ml-4"
            >
              Añadir
            </button>
          </div>
        )}
      </div>

      {/* Carrito de compras */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Carrito</h2>
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center border-b pb-2 gap-4">
              <div className='flex-grow'>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">{formatCurrency(item.price)} c/u</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold p-1 rounded-full w-8 h-8 flex items-center justify-center">-</button>
                <span className="font-semibold w-8 text-center">{item.quantity}</span>
                <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold p-1 rounded-full w-8 h-8 flex items-center justify-center">+</button>
              </div>
              <p className="font-semibold w-24 text-right">{formatCurrency(item.price * item.quantity)}</p>
              <button onClick={() => handleUpdateQuantity(item.id, 0)} className="bg-red-500 hover:bg-red-600 text-white font-bold p-1 rounded-full w-8 h-8 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Tu carrito está vacío</h3>
              <p className="mt-1 text-sm text-gray-500">Selecciona un producto de la lista para añadirlo.</p>
            </div>
          )}
        </div>
        <div className="mt-6 pt-4 border-t flex justify-between items-center">
          <p className="text-xl font-bold">Total:</p>
          <p className="text-xl font-bold">{formatCurrency(total)}</p>
        </div>
        <div className="mt-6 text-right">
          <button 
            onClick={handleRegisterSale}
            disabled={cart.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded disabled:bg-gray-400"
          >
            Registrar Venta
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VentasPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return <>{isClient && <VentasComponent />}</>;
}
