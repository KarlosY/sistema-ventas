// src/application/use-cases/getAllSales.ts

import { ISaleRepository, SaleWithDetails } from '@/domain/repositories/ISaleRepository';

export class GetAllSalesUseCase {
  constructor(private saleRepository: ISaleRepository) {}

  async execute(): Promise<SaleWithDetails[]> {
    return this.saleRepository.getAll();
  }
}
