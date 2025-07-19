// src/domain/entities/Sale.ts

export interface Sale {
  id: number;          // Identificador único de la venta
  total: number;        // Monto total de la venta
  created_at?: string;  // Fecha de creación
}
