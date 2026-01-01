import { NextRequest, NextResponse } from 'next/server';
import { MySQLCategoryRepository } from '@/infrastructure/repositories/MySQLCategoryRepository';

const categoryRepository = new MySQLCategoryRepository();

export async function GET() {
  try {
    const categories = await categoryRepository.getAll();
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Nombre de categoría requerido' },
        { status: 400 }
      );
    }
    
    // Verificar si ya existe
    const existing = await categoryRepository.findByName(name);
    if (existing) {
      return NextResponse.json(existing);
    }
    
    const category = await categoryRepository.create(name);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear categoría:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear categoría' },
      { status: 500 }
    );
  }
}
