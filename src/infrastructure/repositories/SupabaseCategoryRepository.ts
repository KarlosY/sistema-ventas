import { Category } from '@/domain/entities/Category';
import { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';
import { supabase } from '../lib/supabase';

export class SupabaseCategoryRepository implements ICategoryRepository {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) throw new Error(error.message);
    return data || [];
  }

  async findByName(name: string): Promise<Category | null> {
    const { data, error } = await supabase.from('categories').select('*').eq('name', name).single();
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new Error(error.message);
    }
    return data;
  }

  async create(name: string): Promise<Category> {
    const { data, error } = await supabase.from('categories').insert({ name }).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
}
