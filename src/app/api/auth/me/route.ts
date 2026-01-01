import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/infrastructure/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);

    return NextResponse.json({
      user: {
        id: user.userId,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    );
  }
}
