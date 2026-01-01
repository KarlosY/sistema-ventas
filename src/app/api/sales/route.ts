import { NextRequest, NextResponse } from 'next/server';
import { MySQLSaleRepository } from '@/infrastructure/repositories/MySQLSaleRepository';

const saleRepository = new MySQLSaleRepository();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const searchTerm = searchParams.get('search') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    if (startDate && endDate) {
      const result = await saleRepository.findByDateRange(
        new Date(startDate),
        new Date(endDate),
        searchTerm,
        page,
        limit
      );
      return NextResponse.json(result);
    }
    
    const sales = await saleRepository.getAll();
    return NextResponse.json({ sales, totalCount: sales.length });
  } catch (error: any) {
    console.error('Error al obtener ventas:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener ventas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cart } = body;
    
    if (!cart || cart.length === 0) {
      return NextResponse.json(
        { error: 'Carrito vacío' },
        { status: 400 }
      );
    }
    
    const total = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    
    const details = cart.map((item: any) => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));
    
    const sale = await saleRepository.create({ total }, details);
    
    return NextResponse.json(sale, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear venta:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear venta' },
      { status: 500 }
    );
  }
}
