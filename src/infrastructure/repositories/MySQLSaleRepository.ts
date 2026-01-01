import { ISaleRepository, PaginatedSales, SalesSummary, SaleWithDetails } from '@/domain/repositories/ISaleRepository';
import { Sale } from '@/domain/entities/Sale';
import { SaleDetail } from '@/domain/entities/SaleDetail';
import pool from '../lib/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class MySQLSaleRepository implements ISaleRepository {
  async create(sale: Omit<Sale, 'id' | 'created_at'>, details: Omit<SaleDetail, 'id' | 'sale_id'>[]): Promise<Sale> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const invoiceNumber = `B-${Date.now()}`;
      const subtotal = sale.total / 1.18;
      const tax = sale.total - subtotal;
      
      const [saleResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO sales (invoice_number, invoice_type, user_id, subtotal, tax, total_amount, payment_method, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [invoiceNumber, 'Boleta', userId, subtotal, tax, sale.total, 'Efectivo', 'Completada']
      );
      
      const saleId = saleResult.insertId;
      
      for (const detail of details) {
        const [productRows] = await connection.query<RowDataPacket[]>(
          'SELECT name, sale_price FROM products WHERE id = ?',
          [detail.product_id]
        );
        
        if (productRows.length === 0) {
          throw new Error(`Producto con ID ${detail.product_id} no encontrado`);
        }
        
        const product = productRows[0];
        const subtotalDetail = detail.quantity * detail.price;
        
        await connection.query(
          `INSERT INTO sale_details (sale_id, product_id, product_name, quantity, unit_price, subtotal, discount, total) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [saleId, detail.product_id, product.name, detail.quantity, detail.price, subtotalDetail, 0, subtotalDetail]
        );
      }
      
      await connection.commit();
      
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM sales WHERE id = ?',
        [saleId]
      );
      
      return {
        id: rows[0].id,
        total: parseFloat(rows[0].total_amount),
        created_at: rows[0].created_at
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getAll(): Promise<SaleWithDetails[]> {
    const [salesRows] = await pool.query<RowDataPacket[]>(
      `SELECT s.*, u.full_name as user_name
       FROM sales s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.deleted_at IS NULL
       ORDER BY s.created_at DESC`
    );
    
    const sales: SaleWithDetails[] = [];
    
    for (const sale of salesRows) {
      const [detailsRows] = await pool.query<RowDataPacket[]>(
        `SELECT sd.*, p.name as product_name, p.sale_price
         FROM sale_details sd
         LEFT JOIN products p ON sd.product_id = p.id
         WHERE sd.sale_id = ?`,
        [sale.id]
      );
      
      sales.push({
        ...sale,
        id: sale.id,
        total: parseFloat(sale.total_amount),
        created_at: sale.created_at,
        sale_details: detailsRows.map(detail => ({
          id: detail.id,
          sale_id: detail.sale_id,
          product_id: detail.product_id,
          quantity: detail.quantity,
          price: parseFloat(detail.unit_price),
          created_at: detail.created_at,
          products: {
            id: detail.product_id,
            name: detail.product_name,
            price: parseFloat(detail.sale_price || detail.unit_price),
            stock: 0,
            category_id: null
          }
        }))
      });
    }
    
    return sales;
  }

  async findByDateRange(startDate: Date, endDate: Date, searchTerm?: string, page?: number, limit?: number): Promise<PaginatedSales> {
    let query = `
      SELECT s.*, u.full_name as user_name
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.deleted_at IS NULL
        AND s.created_at >= ?
        AND s.created_at < ?
    `;
    
    const params: any[] = [startDate, endDate];
    
    if (searchTerm) {
      query += ` AND s.invoice_number LIKE ?`;
      params.push(`%${searchTerm}%`);
    }
    
    const [countRows] = await pool.query<RowDataPacket[]>(
      query.replace('s.*, u.full_name as user_name', 'COUNT(*) as total'),
      params
    );
    const totalCount = countRows[0].total;
    
    if (page && limit) {
      const offset = (page - 1) * limit;
      query += ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    } else {
      query += ` ORDER BY s.created_at DESC`;
    }
    
    const [salesRows] = await pool.query<RowDataPacket[]>(query, params);
    
    const sales: SaleWithDetails[] = [];
    
    for (const sale of salesRows) {
      const [detailsRows] = await pool.query<RowDataPacket[]>(
        `SELECT sd.*, p.name as product_name, p.sale_price
         FROM sale_details sd
         LEFT JOIN products p ON sd.product_id = p.id
         WHERE sd.sale_id = ?`,
        [sale.id]
      );
      
      sales.push({
        ...sale,
        id: sale.id,
        total: parseFloat(sale.total_amount),
        created_at: sale.created_at,
        sale_details: detailsRows.map(detail => ({
          id: detail.id,
          sale_id: detail.sale_id,
          product_id: detail.product_id,
          quantity: detail.quantity,
          price: parseFloat(detail.unit_price),
          created_at: detail.created_at,
          products: {
            id: detail.product_id,
            name: detail.product_name,
            price: parseFloat(detail.sale_price || detail.unit_price),
            stock: 0,
            category_id: null
          }
        }))
      });
    }
    
    return { sales, totalCount };
  }

  async getSummary(): Promise<SalesSummary> {
    const now = new Date();
    
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    const [todayRows] = await pool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(total_amount), 0) as total
       FROM sales
       WHERE created_at >= ? AND created_at < ? AND status = 'Completada' AND deleted_at IS NULL`,
      [startOfDay, endOfDay]
    );
    
    const todayTotal = parseFloat(todayRows[0].total);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    const [monthRows] = await pool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(total_amount), 0) as total
       FROM sales
       WHERE created_at >= ? AND created_at < ? AND status = 'Completada' AND deleted_at IS NULL`,
      [startOfMonth, endOfMonth]
    );
    
    const monthTotal = parseFloat(monthRows[0].total);
    
    return { today: todayTotal, month: monthTotal };
  }
}
