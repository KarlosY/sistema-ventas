// src/application/use-cases/updateProduct.ts

import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { Product } from '@/domain/entities/Product';

export class UpdateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(id: string, productData: Partial<Omit<Product, 'id' | 'created_at'>>) {
    if (productData.price !== undefined && productData.price < 0) {
      throw new Error('Price cannot be negative.');
    }
    if (productData.stock !== undefined && productData.stock < 0) {
      throw new Error('Stock cannot be negative.');
    }

    return this.productRepository.update(id, productData);
  }
}
