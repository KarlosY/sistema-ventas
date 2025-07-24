// src/infrastructure/repositories/SupabaseProductRepository.ts

import { IProductRepository, PaginatedProducts } from '@/domain/repositories/IProductRepository';
import { Product } from '@/domain/entities/Product';
import { supabase } from '../lib/supabase';

export class SupabaseProductRepository implements IProductRepository {
  private readonly TABLE_NAME = 'products';

  async getAll(searchTerm?: string, page: number = 1, limit: number = 10): Promise<PaginatedProducts> {
    let query = supabase
      .from(this.TABLE_NAME)
      .select('*, categories(name)', { count: 'exact' });

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    query = query.order('name');

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', `Message: ${error.message}, Details: ${error.details}`);
      throw new Error(`Could not fetch products: ${error.message}`);
    }

    return {
      products: data || [],
      totalCount: count || 0,
    };
  }

  async create(productData: Omit<Product, 'id' | 'created_at' | 'categories'>): Promise<Product> {
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

  async update(id: number, productData: Partial<Omit<Product, 'id' | 'created_at' | 'categories'>>): Promise<Product | null> {
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
