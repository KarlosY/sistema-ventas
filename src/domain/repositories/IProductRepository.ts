// src/domain/repositories/IProductRepository.ts

import { Product } from '../entities/Product';

export interface PaginatedProducts {
  products: Product[];
  totalCount: number;
}

/**
 * Interfaz que define las operaciones de persistencia para la entidad Product.
 * Esto es parte de la capa de Dominio y no sabe nada sobre la implementación (Supabase).
 */
export interface IProductRepository {
  /**
   * Obtiene una lista paginada y filtrada de productos.
   * @param searchTerm - Término de búsqueda opcional para filtrar por nombre.
   * @param page - Número de página para la paginación.
   * @param limit - Número de productos por página.
   * @returns Una promesa que se resuelve con un objeto que contiene los productos y el conteo total.
   */
  getAll(searchTerm?: string, page?: number, limit?: number): Promise<PaginatedProducts>;

  /**
   * Crea un nuevo producto.
   * @param product - El producto a crear, sin el id ni la fecha de creación.
   * @returns Una promesa que se resuelve con el producto creado.
   */
  create(product: Omit<Product, 'id' | 'created_at' | 'categories'>): Promise<Product>;

  /**
   * Actualiza un producto existente.
   * @param id - El ID del producto a actualizar.
   * @param productData - Los datos a actualizar.
   * @returns Una promesa que se resuelve con el producto actualizado.
   */
  update(id: number, productData: Partial<Omit<Product, 'id' | 'created_at' | 'categories'>>): Promise<Product | null>;

  /**
   * Elimina un producto.
   * @param id - El ID del producto a eliminar.
   * @returns Una promesa que se resuelve cuando el producto ha sido eliminado.
   */
  delete(id: number): Promise<void>;
}
