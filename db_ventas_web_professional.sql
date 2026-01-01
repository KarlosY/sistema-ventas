-- =====================================================
-- SISTEMA DE VENTAS PROFESIONAL - BASE DE DATOS MySQL
-- Versión: 2.0 Professional
-- Autor: Karlos Berrios
-- Fecha: 2025
-- Descripción: Base de datos completa y escalable para 
--              sistema de ventas comercial
-- =====================================================

-- =====================================================
-- 1. CREACIÓN DE LA BASE DE DATOS
-- =====================================================
DROP DATABASE IF EXISTS db_ventas_web;
CREATE DATABASE db_ventas_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_ventas_web;

-- =====================================================
-- 2. TABLA DE CATEGORÍAS
-- =====================================================
CREATE TABLE categories (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_name (name),
  INDEX idx_active (is_active)
) ENGINE=InnoDB COMMENT='Categorías de productos';

-- =====================================================
-- 3. TABLA DE PRODUCTOS
-- =====================================================
CREATE TABLE products (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único del producto',
  barcode VARCHAR(100) COMMENT 'Código de barras',
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cost_price DECIMAL(12,2) NOT NULL DEFAULT 0.00 CHECK (cost_price >= 0) COMMENT 'Precio de costo',
  sale_price DECIMAL(12,2) NOT NULL CHECK (sale_price >= 0) COMMENT 'Precio de venta',
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock INT NOT NULL DEFAULT 0 COMMENT 'Stock mínimo para alertas',
  max_stock INT NOT NULL DEFAULT 1000 COMMENT 'Stock máximo',
  unit ENUM('Unidad', 'Kg', 'Litro', 'Metro', 'Caja', 'Paquete') NOT NULL DEFAULT 'Unidad',
  category_id BIGINT,
  image_url VARCHAR(500),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) 
    REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_sku (sku),
  INDEX idx_barcode (barcode),
  INDEX idx_name (name),
  INDEX idx_category (category_id),
  INDEX idx_active (is_active),
  INDEX idx_stock (stock)
) ENGINE=InnoDB COMMENT='Productos del inventario';

-- =====================================================
-- 4. TABLA DE CLIENTES
-- =====================================================
CREATE TABLE customers (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  document_type ENUM('DNI', 'RUC', 'CE', 'Pasaporte') NOT NULL DEFAULT 'DNI',
  document_number VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Perú',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT COMMENT 'Observaciones del cliente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uk_document (document_type, document_number),
  INDEX idx_document (document_number),
  INDEX idx_name (name),
  INDEX idx_email (email),
  INDEX idx_active (is_active)
) ENGINE=InnoDB COMMENT='Clientes del sistema';

-- =====================================================
-- 5. TABLA DE USUARIOS
-- =====================================================
CREATE TABLE users (
  id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'UUID del usuario',
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt de la contraseña',
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  password_reset_token VARCHAR(255) NULL,
  password_reset_expires TIMESTAMP NULL,
  last_login TIMESTAMP NULL,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_email (email),
  INDEX idx_active (is_active)
) ENGINE=InnoDB COMMENT='Usuarios del sistema';

-- =====================================================
-- 6. TABLA DE PERFILES (Roles de Usuario)
-- =====================================================
CREATE TABLE profiles (
  id CHAR(36) NOT NULL PRIMARY KEY,
  role ENUM('Administrador', 'Vendedor', 'Supervisor', 'Almacenero') NOT NULL DEFAULT 'Vendedor',
  permissions JSON COMMENT 'Permisos personalizados en formato JSON',
  CONSTRAINT fk_profile_user FOREIGN KEY (id) 
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Perfiles y roles de usuarios';

-- =====================================================
-- 7. TABLA DE VENTAS (Cabecera)
-- =====================================================
CREATE TABLE sales (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE COMMENT 'Número de factura/boleta',
  invoice_type ENUM('Boleta', 'Factura', 'Nota de Venta') NOT NULL DEFAULT 'Boleta',
  customer_id BIGINT,
  user_id CHAR(36) NOT NULL COMMENT 'Usuario que realizó la venta',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  tax DECIMAL(12,2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0) COMMENT 'IGV u otros impuestos',
  discount DECIMAL(12,2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  payment_method ENUM('Efectivo', 'Tarjeta Débito', 'Tarjeta Crédito', 'Transferencia', 'Yape', 'Plin', 'Otro') NOT NULL DEFAULT 'Efectivo',
  status ENUM('Pendiente', 'Completada', 'Cancelada', 'Reembolsada') NOT NULL DEFAULT 'Completada',
  notes TEXT COMMENT 'Observaciones de la venta',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_sale_customer FOREIGN KEY (customer_id) 
    REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT fk_sale_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_invoice (invoice_number),
  INDEX idx_customer (customer_id),
  INDEX idx_user (user_id),
  INDEX idx_created (created_at),
  INDEX idx_status (status),
  INDEX idx_payment (payment_method)
) ENGINE=InnoDB COMMENT='Ventas realizadas (cabecera)';

-- =====================================================
-- 8. TABLA DE DETALLES DE VENTA
-- =====================================================
CREATE TABLE sale_details (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sale_id BIGINT NOT NULL,
  product_id BIGINT,
  product_name VARCHAR(255) NOT NULL COMMENT 'Nombre del producto al momento de la venta',
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0) COMMENT 'Precio unitario al momento de la venta',
  subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0) COMMENT 'quantity * unit_price',
  discount DECIMAL(12,2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
  total DECIMAL(12,2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_detail_sale FOREIGN KEY (sale_id) 
    REFERENCES sales(id) ON DELETE CASCADE,
  CONSTRAINT fk_detail_product FOREIGN KEY (product_id) 
    REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_sale (sale_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB COMMENT='Detalles de cada venta';

-- =====================================================
-- 9. TABLA DE MOVIMIENTOS DE INVENTARIO
-- =====================================================
CREATE TABLE inventory_movements (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  movement_type ENUM('Entrada', 'Salida', 'Ajuste', 'Devolución', 'Merma') NOT NULL,
  quantity INT NOT NULL COMMENT 'Cantidad (positiva para entrada, negativa para salida)',
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  reference_type ENUM('Venta', 'Compra', 'Ajuste Manual', 'Devolución') NULL,
  reference_id BIGINT NULL COMMENT 'ID de la venta, compra, etc.',
  user_id CHAR(36) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_movement_product FOREIGN KEY (product_id) 
    REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_movement_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_product (product_id),
  INDEX idx_type (movement_type),
  INDEX idx_created (created_at)
) ENGINE=InnoDB COMMENT='Historial de movimientos de inventario';

-- =====================================================
-- 10. TABLA DE PROVEEDORES
-- =====================================================
CREATE TABLE suppliers (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ruc VARCHAR(20) NOT NULL UNIQUE,
  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Perú',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_ruc (ruc),
  INDEX idx_business_name (business_name),
  INDEX idx_active (is_active)
) ENGINE=InnoDB COMMENT='Proveedores de productos';

-- =====================================================
-- 11. TABLA DE COMPRAS
-- =====================================================
CREATE TABLE purchases (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  purchase_number VARCHAR(50) UNIQUE,
  supplier_id BIGINT NOT NULL,
  user_id CHAR(36) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status ENUM('Pendiente', 'Recibida', 'Cancelada') NOT NULL DEFAULT 'Pendiente',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_purchase_supplier FOREIGN KEY (supplier_id) 
    REFERENCES suppliers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_purchase_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_supplier (supplier_id),
  INDEX idx_user (user_id),
  INDEX idx_created (created_at),
  INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='Compras a proveedores';

-- =====================================================
-- 12. TABLA DE DETALLES DE COMPRA
-- =====================================================
CREATE TABLE purchase_details (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  purchase_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_cost DECIMAL(12,2) NOT NULL CHECK (unit_cost >= 0),
  subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_purchase_detail_purchase FOREIGN KEY (purchase_id) 
    REFERENCES purchases(id) ON DELETE CASCADE,
  CONSTRAINT fk_purchase_detail_product FOREIGN KEY (product_id) 
    REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_purchase (purchase_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB COMMENT='Detalles de cada compra';

-- =====================================================
-- 13. TABLA DE CONFIGURACIÓN DEL SISTEMA
-- =====================================================
CREATE TABLE system_settings (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  data_type ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Si es accesible desde el frontend',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (setting_key)
) ENGINE=InnoDB COMMENT='Configuración general del sistema';

-- =====================================================
-- 14. TABLA DE AUDITORÍA
-- =====================================================
CREATE TABLE audit_logs (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36),
  action VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, LOGIN, etc.',
  table_name VARCHAR(50) NOT NULL,
  record_id VARCHAR(50),
  old_values JSON COMMENT 'Valores anteriores',
  new_values JSON COMMENT 'Valores nuevos',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_table (table_name),
  INDEX idx_created (created_at)
) ENGINE=InnoDB COMMENT='Registro de auditoría del sistema';

-- =====================================================
-- 15. TRIGGERS
-- =====================================================

-- Trigger: Crear perfil automáticamente al insertar usuario
DELIMITER $$

CREATE TRIGGER after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO profiles (id, role)
    VALUES (NEW.id, 'Vendedor');
END$$

-- Trigger: Registrar movimiento de inventario al crear detalle de venta
CREATE TRIGGER after_sale_detail_insert
AFTER INSERT ON sale_details
FOR EACH ROW
BEGIN
    DECLARE v_previous_stock INT;
    DECLARE v_new_stock INT;
    DECLARE v_user_id CHAR(36);
    
    -- Obtener el stock actual y el usuario de la venta
    SELECT stock INTO v_previous_stock 
    FROM products 
    WHERE id = NEW.product_id;
    
    SELECT user_id INTO v_user_id
    FROM sales
    WHERE id = NEW.sale_id;
    
    -- Calcular nuevo stock
    SET v_new_stock = v_previous_stock - NEW.quantity;
    
    -- Actualizar stock del producto
    UPDATE products 
    SET stock = v_new_stock,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
    
    -- Registrar movimiento de inventario
    INSERT INTO inventory_movements (
        product_id, 
        movement_type, 
        quantity, 
        previous_stock, 
        new_stock, 
        reference_type, 
        reference_id, 
        user_id,
        notes
    ) VALUES (
        NEW.product_id,
        'Salida',
        -NEW.quantity,
        v_previous_stock,
        v_new_stock,
        'Venta',
        NEW.sale_id,
        v_user_id,
        CONCAT('Venta #', NEW.sale_id, ' - ', NEW.product_name)
    );
END$$

-- Trigger: Registrar movimiento de inventario al crear detalle de compra
CREATE TRIGGER after_purchase_detail_insert
AFTER INSERT ON purchase_details
FOR EACH ROW
BEGIN
    DECLARE v_previous_stock INT;
    DECLARE v_new_stock INT;
    DECLARE v_user_id CHAR(36);
    
    -- Obtener el stock actual y el usuario de la compra
    SELECT stock INTO v_previous_stock 
    FROM products 
    WHERE id = NEW.product_id;
    
    SELECT user_id INTO v_user_id
    FROM purchases
    WHERE id = NEW.purchase_id;
    
    -- Calcular nuevo stock
    SET v_new_stock = v_previous_stock + NEW.quantity;
    
    -- Actualizar stock del producto
    UPDATE products 
    SET stock = v_new_stock,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
    
    -- Registrar movimiento de inventario
    INSERT INTO inventory_movements (
        product_id, 
        movement_type, 
        quantity, 
        previous_stock, 
        new_stock, 
        reference_type, 
        reference_id, 
        user_id,
        notes
    ) VALUES (
        NEW.product_id,
        'Entrada',
        NEW.quantity,
        v_previous_stock,
        v_new_stock,
        'Compra',
        NEW.purchase_id,
        v_user_id,
        CONCAT('Compra #', NEW.purchase_id)
    );
END$$

DELIMITER ;

-- =====================================================
-- 16. VISTAS PARA REPORTES
-- =====================================================

-- Vista: Productos con bajo stock
CREATE VIEW v_low_stock_products AS
SELECT 
    p.id,
    p.sku,
    p.name,
    p.stock,
    p.min_stock,
    c.name AS category_name,
    p.sale_price
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.stock <= p.min_stock 
  AND p.is_active = TRUE
  AND p.deleted_at IS NULL
ORDER BY p.stock ASC;

-- Vista: Ventas con detalles completos
CREATE VIEW v_sales_complete AS
SELECT 
    s.id AS sale_id,
    s.invoice_number,
    s.invoice_type,
    s.total_amount,
    s.payment_method,
    s.status,
    s.created_at AS sale_date,
    c.name AS customer_name,
    c.document_number AS customer_document,
    u.full_name AS seller_name,
    u.email AS seller_email,
    sd.id AS detail_id,
    sd.product_name,
    sd.quantity,
    sd.unit_price,
    sd.total AS detail_total
FROM sales s
LEFT JOIN customers c ON s.customer_id = c.id
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN sale_details sd ON s.id = sd.sale_id
WHERE s.deleted_at IS NULL
ORDER BY s.created_at DESC;

-- Vista: Productos más vendidos
CREATE VIEW v_top_selling_products AS
SELECT 
    p.id,
    p.sku,
    p.name,
    p.sale_price,
    c.name AS category_name,
    SUM(sd.quantity) AS total_sold,
    SUM(sd.total) AS total_revenue,
    COUNT(DISTINCT sd.sale_id) AS times_sold
FROM products p
INNER JOIN sale_details sd ON p.id = sd.product_id
INNER JOIN sales s ON sd.sale_id = s.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE s.status = 'Completada'
  AND s.deleted_at IS NULL
GROUP BY p.id, p.sku, p.name, p.sale_price, c.name
ORDER BY total_sold DESC;

-- Vista: Resumen de ventas por vendedor
CREATE VIEW v_sales_by_seller AS
SELECT 
    u.id AS user_id,
    u.full_name AS seller_name,
    u.email,
    COUNT(s.id) AS total_sales,
    SUM(s.total_amount) AS total_revenue,
    AVG(s.total_amount) AS average_sale,
    MAX(s.created_at) AS last_sale_date
FROM users u
INNER JOIN sales s ON u.id = s.user_id
WHERE s.status = 'Completada'
  AND s.deleted_at IS NULL
GROUP BY u.id, u.full_name, u.email
ORDER BY total_revenue DESC;

-- Vista: Rentabilidad por producto
CREATE VIEW v_product_profitability AS
SELECT 
    p.id,
    p.sku,
    p.name,
    p.cost_price,
    p.sale_price,
    (p.sale_price - p.cost_price) AS profit_per_unit,
    ROUND(((p.sale_price - p.cost_price) / p.cost_price * 100), 2) AS profit_margin_percentage,
    p.stock,
    (p.stock * p.cost_price) AS inventory_value,
    c.name AS category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE 
  AND p.deleted_at IS NULL
  AND p.cost_price > 0
ORDER BY profit_margin_percentage DESC;

-- =====================================================
-- 17. STORED PROCEDURES
-- =====================================================

-- Procedimiento: Procesar una venta completa (transacción atómica)
DELIMITER $$

CREATE PROCEDURE sp_process_sale(
    IN p_user_id CHAR(36),
    IN p_customer_id BIGINT,
    IN p_invoice_type VARCHAR(20),
    IN p_payment_method VARCHAR(50),
    IN p_subtotal DECIMAL(12,2),
    IN p_tax DECIMAL(12,2),
    IN p_discount DECIMAL(12,2),
    IN p_total_amount DECIMAL(12,2),
    IN p_notes TEXT,
    IN p_sale_details JSON,
    OUT p_sale_id BIGINT,
    OUT p_error_message VARCHAR(500)
)
BEGIN
    DECLARE v_exit_handler BOOLEAN DEFAULT FALSE;
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
    BEGIN
        SET v_exit_handler = TRUE;
        GET DIAGNOSTICS CONDITION 1 p_error_message = MESSAGE_TEXT;
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    -- Generar número de factura
    SET @invoice_number = CONCAT(
        UPPER(LEFT(p_invoice_type, 1)),
        '-',
        LPAD(FLOOR(RAND() * 999999), 6, '0')
    );
    
    -- Insertar venta
    INSERT INTO sales (
        invoice_number,
        invoice_type,
        customer_id,
        user_id,
        subtotal,
        tax,
        discount,
        total_amount,
        payment_method,
        status,
        notes
    ) VALUES (
        @invoice_number,
        p_invoice_type,
        p_customer_id,
        p_user_id,
        p_subtotal,
        p_tax,
        p_discount,
        p_total_amount,
        p_payment_method,
        'Completada',
        p_notes
    );
    
    SET p_sale_id = LAST_INSERT_ID();
    
    -- Insertar detalles (el trigger se encargará del stock)
    INSERT INTO sale_details (sale_id, product_id, product_name, quantity, unit_price, subtotal, discount, total)
    SELECT 
        p_sale_id,
        JSON_EXTRACT(detail, '$.product_id'),
        JSON_UNQUOTE(JSON_EXTRACT(detail, '$.product_name')),
        JSON_EXTRACT(detail, '$.quantity'),
        JSON_EXTRACT(detail, '$.unit_price'),
        JSON_EXTRACT(detail, '$.subtotal'),
        JSON_EXTRACT(detail, '$.discount'),
        JSON_EXTRACT(detail, '$.total')
    FROM JSON_TABLE(
        p_sale_details,
        '$[*]' COLUMNS(
            detail JSON PATH '$'
        )
    ) AS jt;
    
    IF v_exit_handler THEN
        SET p_sale_id = NULL;
    ELSE
        COMMIT;
        SET p_error_message = NULL;
    END IF;
END$$

-- Procedimiento: Obtener resumen de ventas por período
CREATE PROCEDURE sp_sales_summary(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        DATE(created_at) AS sale_date,
        COUNT(*) AS total_sales,
        SUM(total_amount) AS total_revenue,
        AVG(total_amount) AS average_sale,
        SUM(CASE WHEN payment_method = 'Efectivo' THEN total_amount ELSE 0 END) AS cash_sales,
        SUM(CASE WHEN payment_method IN ('Tarjeta Débito', 'Tarjeta Crédito') THEN total_amount ELSE 0 END) AS card_sales,
        SUM(CASE WHEN payment_method IN ('Yape', 'Plin', 'Transferencia') THEN total_amount ELSE 0 END) AS digital_sales
    FROM sales
    WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date
      AND status = 'Completada'
      AND deleted_at IS NULL
    GROUP BY DATE(created_at)
    ORDER BY sale_date DESC;
END$$

-- Procedimiento: Ajustar stock manualmente
CREATE PROCEDURE sp_adjust_stock(
    IN p_product_id BIGINT,
    IN p_new_stock INT,
    IN p_user_id CHAR(36),
    IN p_notes TEXT,
    OUT p_success BOOLEAN,
    OUT p_error_message VARCHAR(500)
)
BEGIN
    DECLARE v_previous_stock INT;
    DECLARE v_quantity_change INT;
    DECLARE v_movement_type VARCHAR(20);
    DECLARE v_exit_handler BOOLEAN DEFAULT FALSE;
    
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
    BEGIN
        SET v_exit_handler = TRUE;
        GET DIAGNOSTICS CONDITION 1 p_error_message = MESSAGE_TEXT;
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    -- Obtener stock actual
    SELECT stock INTO v_previous_stock
    FROM products
    WHERE id = p_product_id;
    
    IF v_previous_stock IS NULL THEN
        SET p_success = FALSE;
        SET p_error_message = 'Producto no encontrado';
        ROLLBACK;
    ELSE
        -- Calcular cambio
        SET v_quantity_change = p_new_stock - v_previous_stock;
        SET v_movement_type = IF(v_quantity_change >= 0, 'Entrada', 'Salida');
        
        -- Actualizar stock
        UPDATE products
        SET stock = p_new_stock,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_product_id;
        
        -- Registrar movimiento
        INSERT INTO inventory_movements (
            product_id,
            movement_type,
            quantity,
            previous_stock,
            new_stock,
            reference_type,
            user_id,
            notes
        ) VALUES (
            p_product_id,
            'Ajuste',
            v_quantity_change,
            v_previous_stock,
            p_new_stock,
            'Ajuste Manual',
            p_user_id,
            p_notes
        );
        
        IF v_exit_handler THEN
            SET p_success = FALSE;
        ELSE
            COMMIT;
            SET p_success = TRUE;
            SET p_error_message = NULL;
        END IF;
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- 18. DATOS INICIALES DEL SISTEMA
-- =====================================================

-- Configuración del sistema
INSERT INTO system_settings (setting_key, setting_value, data_type, description, is_public) VALUES
('company_name', 'Mi Empresa SAC', 'string', 'Nombre de la empresa', TRUE),
('company_ruc', '20123456789', 'string', 'RUC de la empresa', TRUE),
('company_address', 'Av. Principal 123, Lima, Perú', 'string', 'Dirección de la empresa', TRUE),
('company_phone', '+51 999 888 777', 'string', 'Teléfono de la empresa', TRUE),
('company_email', 'ventas@miempresa.com', 'string', 'Email de contacto', TRUE),
('tax_rate', '0.18', 'number', 'Tasa de IGV (18%)', FALSE),
('currency', 'PEN', 'string', 'Moneda del sistema (Soles Peruanos)', TRUE),
('currency_symbol', 'S/', 'string', 'Símbolo de la moneda', TRUE),
('low_stock_alert', '10', 'number', 'Cantidad mínima para alerta de stock bajo', FALSE),
('invoice_prefix', 'F', 'string', 'Prefijo para facturas', FALSE),
('receipt_prefix', 'B', 'string', 'Prefijo para boletas', FALSE);

-- =====================================================
-- 19. DATOS DE PRUEBA
-- =====================================================

-- Categorías de ejemplo
INSERT INTO categories (name, description, is_active) VALUES
('Laptops', 'Computadoras portátiles de diferentes marcas y especificaciones', TRUE),
('Monitores', 'Pantallas y monitores para computadoras', TRUE),
('Periféricos', 'Teclados, mouse, audífonos y otros accesorios', TRUE),
('Componentes', 'Procesadores, memorias RAM, discos duros', TRUE),
('Impresoras', 'Impresoras láser, de tinta y multifuncionales', TRUE);

-- Productos de ejemplo
INSERT INTO products (sku, name, description, cost_price, sale_price, stock, min_stock, category_id, unit, is_active) VALUES
('LAP-001', 'Laptop Dell Vostro 3400', 'Intel Core i5, 8GB RAM, 256GB SSD, 14 pulgadas', 2000.00, 2500.00, 10, 3, 1, 'Unidad', TRUE),
('LAP-002', 'Laptop HP Pavilion 15', 'AMD Ryzen 5, 16GB RAM, 512GB SSD, 15.6 pulgadas', 2200.00, 2800.00, 8, 3, 1, 'Unidad', TRUE),
('MON-001', 'Monitor LG 24" UltraGear', 'Full HD, 144Hz, IPS, Gaming', 650.00, 850.50, 15, 5, 2, 'Unidad', TRUE),
('MON-002', 'Monitor Samsung 27" Curvo', '4K, 60Hz, VA, Curvo', 800.00, 1050.00, 12, 4, 2, 'Unidad', TRUE),
('PER-001', 'Mouse Logitech G203', 'Gaming, RGB, 8000 DPI', 80.00, 120.00, 50, 10, 3, 'Unidad', TRUE),
('PER-002', 'Teclado Mecánico Razer', 'RGB, Switch Blue, Español', 250.00, 350.00, 20, 5, 3, 'Unidad', TRUE),
('PER-003', 'Audífonos HyperX Cloud II', 'Gaming, 7.1 Surround, USB', 180.00, 250.00, 30, 8, 3, 'Unidad', TRUE),
('COM-001', 'SSD Kingston 480GB', 'SATA III, 500MB/s lectura', 120.00, 180.00, 40, 10, 4, 'Unidad', TRUE),
('COM-002', 'Memoria RAM Corsair 16GB', 'DDR4, 3200MHz, RGB', 180.00, 250.00, 25, 8, 4, 'Unidad', TRUE),
('IMP-001', 'Impresora HP LaserJet Pro', 'Monocromática, WiFi, Dúplex automático', 450.00, 650.00, 8, 3, 5, 'Unidad', TRUE);

-- Clientes de ejemplo
INSERT INTO customers (document_type, document_number, name, email, phone, address, city, is_active) VALUES
('DNI', '12345678', 'Juan Pérez García', 'juan.perez@email.com', '999888777', 'Jr. Los Olivos 456, San Isidro', 'Lima', TRUE),
('RUC', '20123456789', 'Empresa Tech Solutions SAC', 'ventas@techsolutions.com', '014567890', 'Av. Javier Prado 1234, San Isidro', 'Lima', TRUE),
('DNI', '87654321', 'María López Rodríguez', 'maria.lopez@email.com', '988777666', 'Av. Arequipa 789, Miraflores', 'Lima', TRUE),
('RUC', '20987654321', 'Comercial El Progreso EIRL', 'contacto@elprogreso.com', '015678901', 'Jr. Comercio 321, Cercado', 'Lima', TRUE);

-- Usuario administrador de ejemplo (contraseña: admin123 - hash bcrypt)
INSERT INTO users (id, email, password, full_name, phone, is_active, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@sistema.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.Nq8zXu', 'Administrador del Sistema', '999111222', TRUE, TRUE),
('550e8400-e29b-41d4-a716-446655440001', 'vendedor1@sistema.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.Nq8zXu', 'Carlos Vendedor Uno', '988222333', TRUE, TRUE),
('550e8400-e29b-41d4-a716-446655440002', 'vendedor2@sistema.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.Nq8zXu', 'Ana Vendedor Dos', '977333444', TRUE, TRUE);

-- Actualizar perfil del administrador
UPDATE profiles SET role = 'Administrador' WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Proveedores de ejemplo
INSERT INTO suppliers (ruc, business_name, contact_name, email, phone, address, city, is_active) VALUES
('20111222333', 'Distribuidora Tech Import SAC', 'Roberto Gómez', 'ventas@techimport.com', '016789012', 'Av. Industrial 567, Callao', 'Callao', TRUE),
('20444555666', 'Mayorista Electrónica Perú EIRL', 'Sandra Flores', 'contacto@electronicaperu.com', '017890123', 'Jr. Paruro 890, Cercado', 'Lima', TRUE);

-- Venta de ejemplo 1
INSERT INTO sales (invoice_number, invoice_type, customer_id, user_id, subtotal, tax, discount, total_amount, payment_method, status, notes) 
VALUES ('B-000001', 'Boleta', 1, '550e8400-e29b-41d4-a716-446655440001', 2620.00, 471.60, 0.00, 3091.60, 'Efectivo', 'Completada', 'Primera venta de prueba');

SET @sale_id_1 = LAST_INSERT_ID();

INSERT INTO sale_details (sale_id, product_id, product_name, quantity, unit_price, subtotal, discount, total) VALUES
(@sale_id_1, 1, 'Laptop Dell Vostro 3400', 1, 2500.00, 2500.00, 0.00, 2500.00),
(@sale_id_1, 5, 'Mouse Logitech G203', 1, 120.00, 120.00, 0.00, 120.00);

-- Venta de ejemplo 2
INSERT INTO sales (invoice_number, invoice_type, customer_id, user_id, subtotal, tax, discount, total_amount, payment_method, status, notes) 
VALUES ('F-000001', 'Factura', 2, '550e8400-e29b-41d4-a716-446655440001', 1900.50, 342.09, 100.00, 2142.59, 'Transferencia', 'Completada', 'Venta corporativa con descuento');

SET @sale_id_2 = LAST_INSERT_ID();

INSERT INTO sale_details (sale_id, product_id, product_name, quantity, unit_price, subtotal, discount, total) VALUES
(@sale_id_2, 3, 'Monitor LG 24" UltraGear', 2, 850.50, 1701.00, 50.00, 1651.00),
(@sale_id_2, 7, 'Audífonos HyperX Cloud II', 1, 250.00, 250.00, 50.00, 200.00);

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Verificación de tablas creadas
SELECT 'Base de datos creada exitosamente' AS status;
SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'db_ventas_web';
