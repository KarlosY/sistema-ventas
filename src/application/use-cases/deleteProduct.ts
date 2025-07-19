// src/application/use-cases/deleteProduct.ts

import { IProductRepository } from '@/domain/repositories/IProductRepository';

export class DeleteProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(id: string): Promise<void> {
    return this.productRepository.delete(id);
  }
}
