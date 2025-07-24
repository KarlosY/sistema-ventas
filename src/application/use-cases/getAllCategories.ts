import { Category } from '@/domain/entities/Category';
import { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';

export class GetAllCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(): Promise<Category[]> {
    return this.categoryRepository.getAll();
  }
}
