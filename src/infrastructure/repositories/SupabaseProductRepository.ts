// src/infrastructure/repositories/SupabaseProductRepository.ts

import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { Product } from '@/domain/entities/Product';
import { supabase } from '../lib/supabase';

export class SupabaseProductRepository implements IProductRepository {
  private readonly TABLE_NAME = 'products';

  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase.from(this.TABLE_NAME).select('*');
    console.log('Supabase response:', { data, error }); // <-- DEBUG LOG

    if (error) {
      console.error(
        'Error fetching products:',
        `Message: ${error.message}, Details: ${error.details}`
      );
      throw new Error(`Could not fetch products: ${error.message}`);
    }
    return data || [];
  }

  async create(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert(productData)
      .select()
      .single(); // .single() para que devuelva el objeto creado en lugar de un array

    if (error) {
      console.error('Error creating product:', error);
      throw new Error('Could not create product.');
    }

    return data;
  }

  async update(id: number, productData: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<Product | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw new Error('Could not update product.');
    }

    return data;
  }

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw new Error('Could not delete product.');
    }
  }
}
