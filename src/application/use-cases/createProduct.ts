// src/application/use-cases/createProduct.ts

import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { Product } from '@/domain/entities/Product';

export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(productData: Omit<Product, 'id' | 'created_at'>) {
    // Aquí podrías añadir validaciones de negocio antes de crear
    if (productData.price < 0 || productData.stock < 0) {
      throw new Error('Price and stock cannot be negative.');
    }
    
    return this.productRepository.create(productData);
  }
}
