// src/domain/entities/SaleDetail.ts

export interface SaleDetail {
  id?: number;         // Identificador único del detalle
  sale_id: number;      // ID de la venta a la que pertenece
  product_id: number;   // ID del producto vendido
  quantity: number;     // Cantidad vendida
  price: number;        // Precio del producto al momento de la venta
}
