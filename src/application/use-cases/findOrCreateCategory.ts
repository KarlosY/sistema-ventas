import { Category } from '@/domain/entities/Category';
import { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';

export class FindOrCreateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(name: string): Promise<Category> {
    // Evitar crear categorías con nombres vacíos o solo espacios
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Category name cannot be empty.');
    }

    // Buscar si la categoría ya existe
    let category = await this.categoryRepository.findByName(trimmedName);

    // Si no existe, crearla
    if (!category) {
      category = await this.categoryRepository.create(trimmedName);
    }

    return category;
  }
}
