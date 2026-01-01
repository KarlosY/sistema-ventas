import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../lib/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface UserPayload {
  userId: string;
  email: string;
  role: string;
  fullName: string;
}

export async function login(email: string, password: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.*, p.role 
     FROM users u
     INNER JOIN profiles p ON u.id = p.id
     WHERE u.email = ? AND u.is_active = TRUE AND u.deleted_at IS NULL`,
    [email]
  );

  if (rows.length === 0) {
    throw new Error('Usuario no encontrado o inactivo');
  }

  const user = rows[0];

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    throw new Error('Cuenta bloqueada temporalmente. Intenta más tarde.');
  }

  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    await pool.query(
      'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?',
      [user.id]
    );

    if (user.failed_login_attempts + 1 >= 5) {
      const lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      await pool.query(
        'UPDATE users SET locked_until = ? WHERE id = ?',
        [lockUntil, user.id]
      );
      throw new Error('Cuenta bloqueada por múltiples intentos fallidos. Intenta en 30 minutos.');
    }

    throw new Error('Contraseña incorrecta');
  }

  await pool.query(
    'UPDATE users SET failed_login_attempts = 0, last_login = NOW(), locked_until = NULL WHERE id = ?',
    [user.id]
  );

  // Usar jose para generar el token (compatible con Edge Runtime)
  const { createTokenEdge } = await import('./jwt-edge');
  const token = await createTokenEdge({
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    }
  };
}

export function verifyToken(token: string): UserPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error: any) {
    throw new Error('Token inválido o expirado');
  }
}

export async function register(email: string, password: string, fullName: string) {
  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  const [existing] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existing.length > 0) {
    throw new Error('El email ya está registrado');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const userId = crypto.randomUUID();

  await pool.query<ResultSetHeader>(
    'INSERT INTO users (id, email, password, full_name, email_verified) VALUES (?, ?, ?, ?, ?)',
    [userId, email, hashedPassword, fullName, true]
  );

  return { userId, email };
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT password FROM users WHERE id = ?',
    [userId]
  );

  if (rows.length === 0) {
    throw new Error('Usuario no encontrado');
  }

  const isValid = await bcrypt.compare(oldPassword, rows[0].password);
  if (!isValid) {
    throw new Error('Contraseña actual incorrecta');
  }

  if (newPassword.length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  await pool.query(
    'UPDATE users SET password = ? WHERE id = ?',
    [hashedPassword, userId]
  );

  return true;
}
