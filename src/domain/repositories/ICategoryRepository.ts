import { Category } from '../entities/Category';

export interface ICategoryRepository {
  getAll(): Promise<Category[]>;
  findByName(name: string): Promise<Category | null>;
  create(name: string): Promise<Category>;
}
