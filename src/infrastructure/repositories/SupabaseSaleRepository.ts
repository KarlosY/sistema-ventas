// src/infrastructure/repositories/SupabaseSaleRepository.ts

import { ISaleRepository } from '@/domain/repositories/ISaleRepository';
import { Sale } from '@/domain/entities/Sale';
import { SaleDetail } from '@/domain/entities/SaleDetail';
import { SaleWithDetails } from '@/domain/repositories/ISaleRepository';
import { supabase } from '../lib/supabase';

export class SupabaseSaleRepository implements ISaleRepository {
  private readonly SALES_TABLE = 'sales';
  private readonly SALE_DETAILS_TABLE = 'sale_details';
  private readonly PRODUCTS_TABLE = 'products';

  async create(sale: Omit<Sale, 'id' | 'created_at'>, details: Omit<SaleDetail, 'id' | 'sale_id'>[]): Promise<Sale> {
    // NOTA: Para un entorno de producción, esta lógica debería ejecutarse en una
    // Edge Function de Supabase para garantizar la atomicidad (transacción).
    // Aquí se simula la transacción desde el lado del cliente.

    // 1. Crear la venta principal
    const { data: saleData, error: saleError } = await supabase
      .from(this.SALES_TABLE)
      .insert(sale)
      .select()
      .single();

    if (saleError) {
      console.error('Error creating sale:', saleError);
      throw new Error('Could not create sale.');
    }

    const newSale: Sale = saleData;

    // 2. Crear los detalles de la venta
    const saleDetailsToInsert = details.map(detail => ({
      ...detail,
      sale_id: newSale.id,
    }));

    const { error: detailsError } = await supabase
      .from(this.SALE_DETAILS_TABLE)
      .insert(saleDetailsToInsert);

    if (detailsError) {
      console.error('Error creating sale details:', detailsError);
      // Intento de rollback manual (eliminar la venta creada)
      await supabase.from(this.SALES_TABLE).delete().eq('id', newSale.id);
      throw new Error('Could not create sale details.');
    }

    // 3. Actualizar el stock de cada producto (esto también debería ser parte de la transacción)
    for (const detail of details) {
      const { data: product, error: productError } = await supabase
        .from(this.PRODUCTS_TABLE)
        .select('stock')
        .eq('id', detail.product_id)
        .single();

      if (productError || !product) {
        throw new Error(`Product with id ${detail.product_id} not found.`);
      }

      const newStock = product.stock - detail.quantity;
      if (newStock < 0) {
        throw new Error(`Not enough stock for product ${detail.product_id}.`);
      }

      const { error: updateError } = await supabase
        .from(this.PRODUCTS_TABLE)
        .update({ stock: newStock })
        .eq('id', detail.product_id);
        
      if (updateError) {
        // La transacción ya está parcialmente comprometida. Aquí es donde una Edge Function es crucial.
        throw new Error(`Failed to update stock for product ${detail.product_id}.`);
      }
    }

    return newSale;
  }

  async getAll(): Promise<SaleWithDetails[]> {
    const { data, error } = await supabase
      .from(this.SALES_TABLE)
      .select(`
        *,
        sale_details (*,
          products (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sales:', error);
      throw new Error('Could not fetch sales.');
    }

    return data || [];
  }
}
