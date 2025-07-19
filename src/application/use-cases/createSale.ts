// src/application/use-cases/createSale.ts

import { ISaleRepository } from '@/domain/repositories/ISaleRepository';
import { Sale } from '@/domain/entities/Sale';
import { SaleDetail } from '@/domain/entities/SaleDetail';
import { CartItem } from '@/app/ventas/page';

export class CreateSaleUseCase {
  constructor(private saleRepository: ISaleRepository) {}

  async execute(cartItems: CartItem[]): Promise<Sale> {
    if (cartItems.length === 0) {
      throw new Error('Cannot create a sale with no items.');
    }

    // 1. Calcular el total de la venta
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 2. Preparar los datos para el repositorio
    const saleData: Omit<Sale, 'id' | 'created_at'> = { total };
    const saleDetailsData: Omit<SaleDetail, 'id' | 'sale_id'>[] = cartItems.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price, // Guardar el precio al momento de la venta
    }));

    // 3. Ejecutar la creación a través del repositorio
    return this.saleRepository.create(saleData, saleDetailsData);
  }
}
