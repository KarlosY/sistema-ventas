// src/domain/entities/Product.ts

export interface Product {
  id: number;         // Identificador único (numérico, autoincremental)
  name: string;         // Nombre del producto
  price: number;        // Precio de venta
  stock: number;        // Cantidad disponible en inventario
  created_at?: string;  // Fecha de creación (manejada por MySQL)
  category_id: number | null;
  categories?: { name: string } | null;
}
