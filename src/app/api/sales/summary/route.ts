import { NextResponse } from 'next/server';
import { MySQLSaleRepository } from '@/infrastructure/repositories/MySQLSaleRepository';

const saleRepository = new MySQLSaleRepository();

export async function GET() {
  try {
    const summary = await saleRepository.getSummary();
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Error al obtener resumen de ventas:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener resumen' },
      { status: 500 }
    );
  }
}
