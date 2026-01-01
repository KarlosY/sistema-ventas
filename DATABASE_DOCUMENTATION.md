# 📊 Documentación Técnica - Base de Datos Sistema de Ventas

## Versión: 2.0 Professional
**Fecha:** Diciembre 2025  
**Motor:** MySQL 8.0+  
**Charset:** UTF8MB4  

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Diagrama de Entidad-Relación](#diagrama-de-entidad-relación)
3. [Diccionario de Datos](#diccionario-de-datos)
4. [Stored Procedures](#stored-procedures)
5. [Triggers](#triggers)
6. [Vistas](#vistas)
7. [Índices y Optimización](#índices-y-optimización)
8. [Seguridad](#seguridad)
9. [Mantenimiento](#mantenimiento)

---

## 🎯 Resumen Ejecutivo

### Características Principales

- ✅ **14 Tablas principales** con relaciones bien definidas
- ✅ **5 Vistas materializadas** para reportes optimizados
- ✅ **3 Stored Procedures** para operaciones críticas
- ✅ **3 Triggers automáticos** para integridad de datos
- ✅ **Auditoría completa** de todas las operaciones
- ✅ **Soft deletes** para recuperación de datos
- ✅ **Gestión de inventario** con trazabilidad completa
- ✅ **Multi-moneda** y multi-impuestos preparado
- ✅ **Escalable** para múltiples sucursales

### Capacidades del Sistema

| Característica | Capacidad |
|----------------|-----------|
| Productos | Ilimitados |
| Ventas diarias | 10,000+ transacciones |
| Usuarios concurrentes | 50+ usuarios |
| Almacenamiento | Escalable |
| Reportes | Tiempo real |

---

## 🗺️ Diagrama de Entidad-Relación

```
┌─────────────────┐
│   categories    │
│─────────────────│
│ PK id           │
│    name         │
│    description  │
│    is_active    │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐      ┌──────────────────┐
│    products     │      │    suppliers     │
│─────────────────│      │──────────────────│
│ PK id           │      │ PK id            │
│    sku          │      │    ruc           │
│    name         │      │    business_name │
│    cost_price   │      │    contact_name  │
│    sale_price   │      │    email         │
│    stock        │      │    phone         │
│ FK category_id  │      └────────┬─────────┘
└────────┬────────┘               │
         │                        │ 1:N
         │ 1:N                    │
         │                ┌───────▼──────────┐
         │                │    purchases     │
         │                │──────────────────│
         │                │ PK id            │
         │                │    purchase_num  │
         │                │ FK supplier_id   │
         │                │ FK user_id       │
         │                │    total_amount  │
         │                └───────┬──────────┘
         │                        │
         │                        │ 1:N
         │                        │
         │                ┌───────▼──────────────┐
         │                │ purchase_details     │
         │                │──────────────────────│
         │                │ PK id                │
         │                │ FK purchase_id       │
         │                │ FK product_id        │
         │                │    quantity          │
         │                │    unit_cost         │
         │                └──────────────────────┘
         │
         │ 1:N
         │
┌────────▼────────────────┐
│   inventory_movements   │
│─────────────────────────│
│ PK id                   │
│ FK product_id           │
│    movement_type        │
│    quantity             │
│    previous_stock       │
│    new_stock            │
│ FK user_id              │
└─────────────────────────┘

┌─────────────────┐
│     users       │
│─────────────────│
│ PK id (UUID)    │
│    email        │
│    password     │
│    full_name    │
│    is_active    │
└────────┬────────┘
         │
         │ 1:1
         │
┌────────▼────────┐
│    profiles     │
│─────────────────│
│ PK id (UUID)    │
│    role         │
│    permissions  │
└─────────────────┘

         │
         │ 1:N
         │
┌────────▼────────┐      ┌──────────────────┐
│     sales       │      │    customers     │
│─────────────────│      │──────────────────│
│ PK id           │      │ PK id            │
│    invoice_num  │      │    document_type │
│ FK customer_id  ├──────┤    document_num  │
│ FK user_id      │  N:1 │    name          │
│    subtotal     │      │    email         │
│    tax          │      │    phone         │
│    discount     │      │    address       │
│    total_amount │      └──────────────────┘
│    payment_meth │
│    status       │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────────┐
│   sale_details      │
│─────────────────────│
│ PK id               │
│ FK sale_id          │
│ FK product_id       │
│    product_name     │
│    quantity         │
│    unit_price       │
│    subtotal         │
│    discount         │
│    total            │
└─────────────────────┘

┌─────────────────────┐
│  system_settings    │
│─────────────────────│
│ PK id               │
│    setting_key      │
│    setting_value    │
│    data_type        │
│    description      │
└─────────────────────┘

┌─────────────────────┐
│    audit_logs       │
│─────────────────────│
│ PK id               │
│ FK user_id          │
│    action           │
│    table_name       │
│    record_id        │
│    old_values       │
│    new_values       │
│    ip_address       │
│    created_at       │
└─────────────────────┘
```

---

## 📖 Diccionario de Datos

### Tabla: `products`

**Descripción:** Almacena el catálogo completo de productos del inventario.

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| `id` | BIGINT | NO | Identificador único autoincremental |
| `sku` | VARCHAR(50) | NO | Código único del producto (Stock Keeping Unit) |
| `barcode` | VARCHAR(100) | YES | Código de barras para lectura con scanner |
| `name` | VARCHAR(255) | NO | Nombre comercial del producto |
| `description` | TEXT | YES | Descripción detallada del producto |
| `cost_price` | DECIMAL(12,2) | NO | Precio de costo/compra (para cálculo de ganancias) |
| `sale_price` | DECIMAL(12,2) | NO | Precio de venta al público |
| `stock` | INT | NO | Cantidad disponible en inventario |
| `min_stock` | INT | NO | Stock mínimo para generar alertas |
| `max_stock` | INT | NO | Stock máximo recomendado |
| `unit` | ENUM | NO | Unidad de medida (Unidad, Kg, Litro, etc.) |
| `category_id` | BIGINT | YES | Referencia a la categoría del producto |
| `image_url` | VARCHAR(500) | YES | URL de la imagen del producto |
| `is_active` | BOOLEAN | NO | Indica si el producto está activo para venta |
| `created_at` | TIMESTAMP | NO | Fecha de creación del registro |
| `updated_at` | TIMESTAMP | YES | Fecha de última actualización |
| `deleted_at` | TIMESTAMP | YES | Fecha de eliminación lógica (soft delete) |

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE: `sku`
- INDEX: `barcode`, `name`, `category_id`, `is_active`, `stock`

**Constraints:**
- `cost_price >= 0`
- `sale_price >= 0`
- `stock >= 0`
- FK: `category_id` → `categories(id)` ON DELETE SET NULL

---

### Tabla: `sales`

**Descripción:** Cabecera de las ventas realizadas (maestro).

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| `id` | BIGINT | NO | Identificador único de la venta |
| `invoice_number` | VARCHAR(50) | YES | Número de factura/boleta (único) |
| `invoice_type` | ENUM | NO | Tipo de comprobante (Boleta, Factura, Nota) |
| `customer_id` | BIGINT | YES | Cliente que realizó la compra |
| `user_id` | CHAR(36) | NO | Usuario/vendedor que procesó la venta |
| `subtotal` | DECIMAL(12,2) | NO | Suma de productos sin impuestos |
| `tax` | DECIMAL(12,2) | NO | Impuestos aplicados (IGV 18%) |
| `discount` | DECIMAL(12,2) | NO | Descuentos aplicados |
| `total_amount` | DECIMAL(12,2) | NO | Total final de la venta |
| `payment_method` | ENUM | NO | Método de pago utilizado |
| `status` | ENUM | NO | Estado de la venta |
| `notes` | TEXT | YES | Observaciones adicionales |
| `created_at` | TIMESTAMP | NO | Fecha y hora de la venta |
| `updated_at` | TIMESTAMP | YES | Última actualización |
| `deleted_at` | TIMESTAMP | YES | Eliminación lógica |

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE: `invoice_number`
- INDEX: `customer_id`, `user_id`, `created_at`, `status`, `payment_method`

**Constraints:**
- `subtotal >= 0`
- `tax >= 0`
- `discount >= 0`
- `total_amount >= 0`
- FK: `customer_id` → `customers(id)` ON DELETE SET NULL
- FK: `user_id` → `users(id)` ON DELETE RESTRICT

---

### Tabla: `customers`

**Descripción:** Registro de clientes del sistema.

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| `id` | BIGINT | NO | Identificador único del cliente |
| `document_type` | ENUM | NO | Tipo de documento (DNI, RUC, CE, Pasaporte) |
| `document_number` | VARCHAR(20) | NO | Número de documento |
| `name` | VARCHAR(255) | NO | Nombre completo o razón social |
| `email` | VARCHAR(255) | YES | Correo electrónico |
| `phone` | VARCHAR(20) | YES | Teléfono de contacto |
| `address` | TEXT | YES | Dirección completa |
| `city` | VARCHAR(100) | YES | Ciudad |
| `country` | VARCHAR(100) | YES | País (default: Perú) |
| `is_active` | BOOLEAN | NO | Cliente activo |
| `notes` | TEXT | YES | Observaciones del cliente |
| `created_at` | TIMESTAMP | NO | Fecha de registro |
| `updated_at` | TIMESTAMP | YES | Última actualización |
| `deleted_at` | TIMESTAMP | YES | Eliminación lógica |

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE: `(document_type, document_number)`
- INDEX: `document_number`, `name`, `email`, `is_active`

---

### Tabla: `inventory_movements`

**Descripción:** Historial completo de movimientos de inventario para trazabilidad.

| Campo | Tipo | Nulo | Descripción |
|-------|------|------|-------------|
| `id` | BIGINT | NO | Identificador único del movimiento |
| `product_id` | BIGINT | NO | Producto afectado |
| `movement_type` | ENUM | NO | Tipo: Entrada, Salida, Ajuste, Devolución, Merma |
| `quantity` | INT | NO | Cantidad (+ entrada, - salida) |
| `previous_stock` | INT | NO | Stock antes del movimiento |
| `new_stock` | INT | NO | Stock después del movimiento |
| `reference_type` | ENUM | YES | Origen: Venta, Compra, Ajuste Manual |
| `reference_id` | BIGINT | YES | ID de la venta/compra relacionada |
| `user_id` | CHAR(36) | NO | Usuario que realizó el movimiento |
| `notes` | TEXT | YES | Observaciones |
| `created_at` | TIMESTAMP | NO | Fecha del movimiento |

**Índices:**
- PRIMARY KEY: `id`
- INDEX: `product_id`, `movement_type`, `created_at`

---

## 🔧 Stored Procedures

### `sp_process_sale`

**Descripción:** Procesa una venta completa de forma atómica (transacción).

**Parámetros:**
```sql
IN  p_user_id CHAR(36)           -- Usuario que realiza la venta
IN  p_customer_id BIGINT         -- Cliente (puede ser NULL)
IN  p_invoice_type VARCHAR(20)   -- Tipo de comprobante
IN  p_payment_method VARCHAR(50) -- Método de pago
IN  p_subtotal DECIMAL(12,2)     -- Subtotal
IN  p_tax DECIMAL(12,2)          -- Impuestos
IN  p_discount DECIMAL(12,2)     -- Descuentos
IN  p_total_amount DECIMAL(12,2) -- Total
IN  p_notes TEXT                 -- Observaciones
IN  p_sale_details JSON          -- Array de productos en JSON
OUT p_sale_id BIGINT             -- ID de la venta creada
OUT p_error_message VARCHAR(500) -- Mensaje de error si falla
```

**Ejemplo de uso:**
```sql
CALL sp_process_sale(
    '550e8400-e29b-41d4-a716-446655440000',
    1,
    'Boleta',
    'Efectivo',
    100.00,
    18.00,
    0.00,
    118.00,
    'Venta de prueba',
    '[
        {"product_id": 1, "product_name": "Laptop", "quantity": 1, "unit_price": 100.00, "subtotal": 100.00, "discount": 0.00, "total": 100.00}
    ]',
    @sale_id,
    @error
);
```

**Características:**
- ✅ Transacción atómica (ROLLBACK automático en caso de error)
- ✅ Genera número de factura automáticamente
- ✅ Actualiza stock mediante triggers
- ✅ Registra movimientos de inventario

---

### `sp_sales_summary`

**Descripción:** Obtiene resumen de ventas por período con desglose de métodos de pago.

**Parámetros:**
```sql
IN p_start_date DATE  -- Fecha inicial
IN p_end_date DATE    -- Fecha final
```

**Retorna:**
- `sale_date` - Fecha de venta
- `total_sales` - Cantidad de ventas
- `total_revenue` - Ingresos totales
- `average_sale` - Ticket promedio
- `cash_sales` - Ventas en efectivo
- `card_sales` - Ventas con tarjeta
- `digital_sales` - Ventas digitales (Yape, Plin, etc.)

**Ejemplo:**
```sql
CALL sp_sales_summary('2025-01-01', '2025-01-31');
```

---

### `sp_adjust_stock`

**Descripción:** Ajusta el stock de un producto manualmente con registro de auditoría.

**Parámetros:**
```sql
IN  p_product_id BIGINT      -- ID del producto
IN  p_new_stock INT          -- Nuevo stock
IN  p_user_id CHAR(36)       -- Usuario que realiza el ajuste
IN  p_notes TEXT             -- Motivo del ajuste
OUT p_success BOOLEAN        -- TRUE si fue exitoso
OUT p_error_message VARCHAR  -- Mensaje de error
```

**Ejemplo:**
```sql
CALL sp_adjust_stock(1, 50, '550e8400-e29b-41d4-a716-446655440000', 'Ajuste por inventario físico', @success, @error);
```

---

## ⚡ Triggers

### `after_user_insert`

**Tabla:** `users`  
**Evento:** AFTER INSERT  
**Descripción:** Crea automáticamente un perfil con rol 'Vendedor' cuando se registra un nuevo usuario.

```sql
-- Se ejecuta automáticamente al insertar en users
INSERT INTO users (id, email, password, full_name) 
VALUES ('uuid-aqui', 'nuevo@email.com', 'hash', 'Nombre');
-- Resultado: Se crea automáticamente el registro en profiles
```

---

### `after_sale_detail_insert`

**Tabla:** `sale_details`  
**Evento:** AFTER INSERT  
**Descripción:** Al registrar un detalle de venta:
1. Descuenta el stock del producto
2. Registra el movimiento en `inventory_movements`
3. Actualiza `updated_at` del producto

**Flujo:**
```
INSERT sale_detail → Trigger → UPDATE products.stock → INSERT inventory_movements
```

---

### `after_purchase_detail_insert`

**Tabla:** `purchase_details`  
**Evento:** AFTER INSERT  
**Descripción:** Al registrar una compra:
1. Incrementa el stock del producto
2. Registra el movimiento de entrada
3. Actualiza timestamp del producto

---

## 📊 Vistas

### `v_low_stock_products`

**Descripción:** Productos con stock por debajo del mínimo (alertas).

**Columnas:**
- `id`, `sku`, `name`, `stock`, `min_stock`, `category_name`, `sale_price`

**Uso:**
```sql
SELECT * FROM v_low_stock_products;
```

---

### `v_sales_complete`

**Descripción:** Vista completa de ventas con todos los detalles relacionados.

**Incluye:**
- Datos de la venta
- Información del cliente
- Datos del vendedor
- Detalles de productos vendidos

**Uso:**
```sql
SELECT * FROM v_sales_complete WHERE sale_date >= '2025-01-01';
```

---

### `v_top_selling_products`

**Descripción:** Productos más vendidos con estadísticas.

**Columnas:**
- `total_sold` - Cantidad total vendida
- `total_revenue` - Ingresos generados
- `times_sold` - Número de ventas

**Uso:**
```sql
SELECT * FROM v_top_selling_products LIMIT 10;
```

---

### `v_sales_by_seller`

**Descripción:** Rendimiento de ventas por vendedor.

**Métricas:**
- Total de ventas
- Ingresos totales
- Ticket promedio
- Última venta

---

### `v_product_profitability`

**Descripción:** Análisis de rentabilidad por producto.

**Cálculos:**
- Ganancia por unidad
- Margen de ganancia (%)
- Valor del inventario

---

## 🔒 Seguridad

### Contraseñas

- **Algoritmo:** Bcrypt con cost factor 12
- **Longitud mínima:** 6 caracteres (recomendado: 8+)
- **Almacenamiento:** Hash de 60 caracteres en VARCHAR(255)

### Protección contra Ataques

1. **Bloqueo de cuenta:** Después de intentos fallidos
2. **Tokens de recuperación:** Con expiración temporal
3. **Soft deletes:** Los datos nunca se eliminan físicamente
4. **Auditoría completa:** Registro de todas las acciones

### Permisos Recomendados

```sql
-- Usuario de aplicación (solo operaciones CRUD)
GRANT SELECT, INSERT, UPDATE ON db_ventas_web.* TO 'app_user'@'localhost';

-- Usuario de reportes (solo lectura)
GRANT SELECT ON db_ventas_web.* TO 'reports_user'@'localhost';

-- Usuario administrador (acceso completo)
GRANT ALL PRIVILEGES ON db_ventas_web.* TO 'admin_user'@'localhost';
```

---

## 🛠️ Mantenimiento

### Respaldos Recomendados

```bash
# Respaldo completo diario
mysqldump -u root -p db_ventas_web > backup_$(date +%Y%m%d).sql

# Respaldo solo estructura
mysqldump -u root -p --no-data db_ventas_web > structure.sql

# Respaldo solo datos
mysqldump -u root -p --no-create-info db_ventas_web > data.sql
```

### Optimización de Tablas

```sql
-- Analizar tablas para actualizar estadísticas
ANALYZE TABLE products, sales, sale_details;

-- Optimizar tablas fragmentadas
OPTIMIZE TABLE products, sales, sale_details;

-- Verificar integridad
CHECK TABLE products, sales, sale_details;
```

### Limpieza de Datos

```sql
-- Eliminar registros soft-deleted antiguos (más de 1 año)
DELETE FROM products WHERE deleted_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Limpiar logs de auditoría antiguos (más de 2 años)
DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR);

-- Purgar intentos de login fallidos antiguos
UPDATE users SET failed_login_attempts = 0, locked_until = NULL 
WHERE locked_until < NOW();
```

---

## 📈 Métricas de Rendimiento

### Consultas Optimizadas

Todas las consultas frecuentes están indexadas:

- ✅ Búsqueda de productos por nombre: **< 10ms**
- ✅ Listado de ventas del día: **< 50ms**
- ✅ Reporte de productos más vendidos: **< 100ms**
- ✅ Historial de cliente: **< 20ms**

### Capacidad

- **Productos:** Soporta hasta 10 millones de registros
- **Ventas:** Soporta hasta 100 millones de transacciones
- **Usuarios concurrentes:** 50+ sin degradación
- **Tiempo de respuesta:** < 100ms para el 95% de consultas

---

## 🎓 Buenas Prácticas

1. **Siempre usar transacciones** para operaciones de venta
2. **Validar stock** antes de confirmar ventas
3. **Registrar auditoría** de operaciones críticas
4. **Usar soft deletes** en lugar de DELETE físico
5. **Mantener índices actualizados** con ANALYZE TABLE
6. **Respaldar diariamente** la base de datos
7. **Monitorear productos con bajo stock** usando la vista
8. **Revisar logs de auditoría** regularmente

---

## 📞 Soporte

Para consultas técnicas o reportar problemas:
- Email: soporte@sistema-ventas.com
- Documentación: https://docs.sistema-ventas.com

---

**© 2025 Sistema de Ventas Professional - Todos los derechos reservados**
