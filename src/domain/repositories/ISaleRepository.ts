// src/domain/repositories/ISaleRepository.ts

import { Sale } from '../entities/Sale';
import { SaleDetail } from '../entities/SaleDetail';
import { Product } from '../entities/Product';

export interface SaleWithDetails extends Sale {
  sale_details: (SaleDetail & { products: Product | null })[];
}

export interface PaginatedSales {
  sales: SaleWithDetails[];
  totalCount: number;
}

export interface SalesSummary {
  today: number;
  month: number;
}

export interface SalesSummary {
  today: number;
  month: number;
}

export interface ISaleRepository {
  /**
   * Crea una nueva venta junto con sus detalles.
   * Esta operación debe ser atómica (transaccional).
   * @param sale - Los datos de la venta.
   * @param details - Un array con los detalles de la venta.
   * @returns Una promesa que se resuelve con la venta creada.
   */
  create(sale: Omit<Sale, 'id' | 'created_at'>, details: Omit<SaleDetail, 'id' | 'sale_id'>[]): Promise<Sale>;

  /**
   * Obtiene todas las ventas con sus detalles y los productos asociados.
   * @returns Una promesa que se resuelve con un array de ventas.
   */
  getAll(): Promise<SaleWithDetails[]>;

  /**
   * Obtiene todas las ventas dentro de un rango de fechas específico.
   * @param startDate - La fecha de inicio del rango.
   * @param endDate - La fecha de fin del rango.
   * @param searchTerm - Término de búsqueda opcional para filtrar por nombre de producto.
   * @param page - Número de página opcional para la paginación.
   * @param limit - Número de resultados por página opcional.
   * @returns Una promesa que se resuelve con un objeto que contiene las ventas y el conteo total.
   */
  findByDateRange(startDate: Date, endDate: Date, searchTerm?: string, page?: number, limit?: number): Promise<PaginatedSales>;
  getSummary(): Promise<SalesSummary>;
}
