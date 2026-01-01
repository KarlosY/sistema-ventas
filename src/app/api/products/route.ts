import { NextRequest, NextResponse } from 'next/server';
import { MySQLProductRepository } from '@/infrastructure/repositories/MySQLProductRepository';

const productRepository = new MySQLProductRepository();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchTerm = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await productRepository.getAll(searchTerm, page, limit);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await productRepository.create(body);
    
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear producto' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    const product = await productRepository.update(id, data);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = parseInt(searchParams.get('id') || '0');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de producto requerido' },
        { status: 400 }
      );
    }
    
    await productRepository.delete(id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}
