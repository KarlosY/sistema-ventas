'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/domain/entities/Product';
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';
import { GetAllProductsUseCase } from '@/application/use-cases/getAllProducts';
import { CreateSaleUseCase } from '@/application/use-cases/createSale';
import { SupabaseSaleRepository } from '@/infrastructure/repositories/SupabaseSaleRepository';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatCurrency } from '@/utils/currency';

export interface CartItem extends Product {
  quantity: number;
}

function VentasComponent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Instanciamos dependencias
  const productRepository = new SupabaseProductRepository();
  const saleRepository = new SupabaseSaleRepository();
  const getAllProducts = new GetAllProductsUseCase(productRepository);
  const createSale = new CreateSaleUseCase(saleRepository);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsData = await getAllProducts.execute();
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading products:", error);
        toast.error("No se pudieron cargar los productos disponibles.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
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

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleRegisterSale = async () => {
    if (cart.length === 0) return;

    try {
      await createSale.execute(cart);
      toast.success(`Venta registrada exitosamente por un total de: ${formatCurrency(total)}`);
      setCart([]); // Limpiar carrito
      // Opcional: Recargar la lista de productos para reflejar el nuevo stock
      const productsData = await getAllProducts.execute();
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
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Seleccione un producto</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatCurrency(p.price)}) - Stock: {p.stock}
                </option>
              ))}
            </select>
            <button 
              onClick={handleAddProduct}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
            <div key={item.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
              </div>
              <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
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
