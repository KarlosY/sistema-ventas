// src/app/use-cases/getSalesSummary.ts
import { ISaleRepository, SalesSummary } from '@/domain/repositories/ISaleRepository';

export class GetSalesSummary {
  constructor(private saleRepository: ISaleRepository) {}

  async execute(): Promise<SalesSummary> {
    return this.saleRepository.getSummary();
  }
}
