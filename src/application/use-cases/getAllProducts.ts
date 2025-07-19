// src/application/use-cases/getAllProducts.ts

import { IProductRepository } from '@/domain/repositories/IProductRepository';

export class GetAllProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute() {
    return this.productRepository.getAll();
  }
}
