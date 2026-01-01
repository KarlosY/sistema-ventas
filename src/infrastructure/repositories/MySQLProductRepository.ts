import { IProductRepository, PaginatedProducts } from '@/domain/repositories/IProductRepository';
import { Product } from '@/domain/entities/Product';
import pool from '../lib/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class MySQLProductRepository implements IProductRepository {
  async getAll(searchTerm?: string, page: number = 1, limit: number = 10): Promise<PaginatedProducts> {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL
    `;
    
    const params: any[] = [];
    
    if (searchTerm) {
      query += ` AND p.name LIKE ?`;
      params.push(`%${searchTerm}%`);
    }
    
    const [countRows] = await pool.query<RowDataPacket[]>(
      query.replace('p.*, c.name as category_name', 'COUNT(*) as total'),
      params
    );
    const totalCount = countRows[0].total;
    
    query += ` ORDER BY p.name LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    
    const products = rows.map(row => ({
      id: row.id,
      sku: row.sku,
      name: row.name,
      price: parseFloat(row.sale_price),
      stock: row.stock,
      category_id: row.category_id,
      created_at: row.created_at,
      categories: row.category_name ? { name: row.category_name } : null
    }));
    
    return { products, totalCount };
  }

  async create(productData: Omit<Product, 'id' | 'created_at' | 'categories'>): Promise<Product> {
    const sku = productData.name ? `PROD-${Date.now()}` : 'PROD-000000';
    
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO products (sku, name, sale_price, stock, category_id, cost_price, min_stock, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sku,
        productData.name,
        productData.price,
        productData.stock,
        productData.category_id,
        productData.price * 0.7,
        5,
        true
      ]
    );
    
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM products WHERE id = ?',
      [result.insertId]
    );
    
    return {
      id: rows[0].id,
      name: rows[0].name,
      price: parseFloat(rows[0].sale_price),
      stock: rows[0].stock,
      category_id: rows[0].category_id,
      created_at: rows[0].created_at
    };
  }

  async update(id: number, productData: Partial<Omit<Product, 'id' | 'created_at' | 'categories'>>): Promise<Product | null> {
    const updates: string[] = [];
    const values: any[] = [];
    
    if (productData.name !== undefined) {
      updates.push('name = ?');
      values.push(productData.name);
    }
    if (productData.price !== undefined) {
      updates.push('sale_price = ?');
      values.push(productData.price);
    }
    if (productData.stock !== undefined) {
      updates.push('stock = ?');
      values.push(productData.stock);
    }
    if (productData.category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(productData.category_id);
    }
    
    if (updates.length === 0) {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );
      return rows[0] ? {
        id: rows[0].id,
        name: rows[0].name,
        price: parseFloat(rows[0].sale_price),
        stock: rows[0].stock,
        category_id: rows[0].category_id,
        created_at: rows[0].created_at
      } : null;
    }
    
    values.push(id);
    
    await pool.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    
    return rows[0] ? {
      id: rows[0].id,
      name: rows[0].name,
      price: parseFloat(rows[0].sale_price),
      stock: rows[0].stock,
      category_id: rows[0].category_id,
      created_at: rows[0].created_at
    } : null;
  }

  async delete(id: number): Promise<void> {
    await pool.query(
      'UPDATE products SET deleted_at = NOW() WHERE id = ?',
      [id]
    );
  }
}
