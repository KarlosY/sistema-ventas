// Versión compatible con Edge Runtime usando jose
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

export interface UserPayload {
  userId: string;
  email: string;
  role: string;
  fullName: string;
}

export async function verifyTokenEdge(token: string): Promise<UserPayload> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as UserPayload;
  } catch (error: any) {
    throw new Error('Token inválido o expirado');
  }
}

export async function createTokenEdge(payload: UserPayload): Promise<string> {
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
  
  return token;
}
