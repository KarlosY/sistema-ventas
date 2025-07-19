'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/domain/entities/Product';
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';
import { GetAllProductsUseCase } from '@/application/use-cases/getAllProducts';
import { CreateSaleUseCase } from '@/application/use-cases/createSale';
import { SupabaseSaleRepository } from '@/infrastructure/repositories/SupabaseSaleRepository';

export interface CartItem extends Product {
  quantity: number;
}

function VentasComponent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Instanciamos dependencias
  const productRepository = new SupabaseProductRepository();
  const saleRepository = new SupabaseSaleRepository();
  const getAllProducts = new GetAllProductsUseCase(productRepository);
  const createSale = new CreateSaleUseCase(saleRepository);

  useEffect(() => {
    const loadProducts = async () => {
      const productsData = await getAllProducts.execute();
      setProducts(productsData);
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
      alert(`No puedes añadir más de ${productToAdd.stock} unidades de "${productToAdd.name}", que es el stock disponible.`);
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
      alert(`Venta registrada exitosamente por un total de: $${total.toFixed(2)}`);
      setCart([]); // Limpiar carrito
      // Opcional: Recargar la lista de productos para reflejar el nuevo stock
      const productsData = await getAllProducts.execute();
      setProducts(productsData);
    } catch (error) {
      alert(`Error al registrar la venta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Registrar Venta</h1>

      {/* Sección para agregar productos */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Añadir Producto</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Seleccione un producto</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} (${p.price.toFixed(2)})
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
              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          {cart.length === 0 && (
            <p className="text-gray-500">El carrito está vacío.</p>
          )}
        </div>
        <div className="mt-6 pt-4 border-t flex justify-between items-center">
          <p className="text-xl font-bold">Total:</p>
          <p className="text-xl font-bold">${total.toFixed(2)}</p>
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
