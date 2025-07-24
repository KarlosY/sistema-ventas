// src/application/use-cases/getAllProducts.ts

import { IProductRepository, PaginatedProducts } from '@/domain/repositories/IProductRepository';

export class GetAllProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(searchTerm?: string, page?: number, limit?: number): Promise<PaginatedProducts> {
    return this.productRepository.getAll(searchTerm, page, limit);
  }
}
