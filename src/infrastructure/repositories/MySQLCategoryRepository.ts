import { Category } from '@/domain/entities/Category';
import { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';
import pool from '../lib/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class MySQLCategoryRepository implements ICategoryRepository {
  async getAll(): Promise<Category[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM categories WHERE deleted_at IS NULL ORDER BY name'
    );
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      created_at: row.created_at
    }));
  }

  async findByName(name: string): Promise<Category | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM categories WHERE name = ? AND deleted_at IS NULL',
      [name]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    return {
      id: rows[0].id,
      name: rows[0].name,
      created_at: rows[0].created_at
    };
  }

  async create(name: string): Promise<Category> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO categories (name, is_active) VALUES (?, ?)',
      [name, true]
    );
    
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM categories WHERE id = ?',
      [result.insertId]
    );
    
    return {
      id: rows[0].id,
      name: rows[0].name,
      created_at: rows[0].created_at
    };
  }
}
