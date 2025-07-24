import { ISaleRepository, PaginatedSales } from '@/domain/repositories/ISaleRepository';

export class GetSalesByDateRangeUseCase {
  constructor(private saleRepository: ISaleRepository) {}

  async execute(startDate: Date, endDate: Date, searchTerm?: string, page?: number, limit?: number): Promise<PaginatedSales> {
    // We add one day to the end date to include all sales of that day until 23:59:59
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    return this.saleRepository.findByDateRange(startDate, adjustedEndDate, searchTerm, page, limit);
  }
}
