'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/domain/entities/Product';
import { Category } from '@/domain/entities/Category';
import { SupabaseProductRepository } from '@/infrastructure/repositories/SupabaseProductRepository';
import { SupabaseCategoryRepository } from '@/infrastructure/repositories/SupabaseCategoryRepository';
import { GetAllProductsUseCase } from '@/application/use-cases/getAllProducts';
import { CreateProductUseCase } from '@/application/use-cases/createProduct';
import { UpdateProductUseCase } from '@/application/use-cases/updateProduct';
import { DeleteProductUseCase } from '@/application/use-cases/deleteProduct';
import { GetAllCategoriesUseCase } from '@/application/use-cases/getAllCategories';
import { FindOrCreateCategoryUseCase } from '@/application/use-cases/findOrCreateCategory';
import ProductForm from '@/components/ProductForm';
import ProductList from '@/components/ProductList'; // Import the new component
import { toast } from 'sonner';
import Link from 'next/link';

// Instantiate repositories and use cases outside the component
const productRepository = new SupabaseProductRepository();
const categoryRepository = new SupabaseCategoryRepository();
const getAllProducts = new GetAllProductsUseCase(productRepository);
const createProduct = new CreateProductUseCase(productRepository);
const updateProduct = new UpdateProductUseCase(productRepository);
const deleteProduct = new DeleteProductUseCase(productRepository);
const getAllCategories = new GetAllCategoriesUseCase(categoryRepository);
const findOrCreateCategory = new FindOrCreateCategoryUseCase(categoryRepository);

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const ITEMS_PER_PAGE = 5;

  const loadData = useCallback(async (search: string, page: number) => {
    try {
      setLoading(true);
      const { products: productsData, totalCount } = await getAllProducts.execute(search, page, ITEMS_PER_PAGE);
      setProducts(productsData);
      setTotalProducts(totalCount);

      if (categories.length === 0) {
        const categoriesData = await getAllCategories.execute();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, [categories.length]);

  useEffect(() => {
    loadData(searchTerm, currentPage);
  }, [searchTerm, currentPage, loadData]);

  const handleCreate = () => {
    setEditingProduct(undefined);
    setIsFormVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormVisible(true);
  };

  const handleDelete = (id: number) => {
    toast("¿Estás seguro de que quieres eliminar este producto?", {
      action: {
        label: "Eliminar",
        onClick: async () => {
          try {
            await deleteProduct.execute(id);
            toast.success("Producto eliminado exitosamente");
            loadData(searchTerm, currentPage);
          } catch (error) {
            toast.error("No se pudo eliminar el producto");
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
    });
  };

  const handleSave = async (productData: Omit<Product, 'id' | 'created_at' | 'categories'> & { newCategoryName?: string }) => {
    try {
      let finalCategoryId = productData.category_id;

      if (productData.newCategoryName) {
        try {
          const newCategory = await findOrCreateCategory.execute(productData.newCategoryName);
          finalCategoryId = newCategory.id;
          setCategories(prev => [...prev, newCategory]);
        } catch (error) {
          console.error("Error creating category:", error);
          toast.error("No se pudo crear la nueva categoría.");
          return;
        }
      }

      const productToSave = { ...productData, category_id: finalCategoryId };

      if (editingProduct) {
        await updateProduct.execute(editingProduct.id, productToSave);
      } else {
        await createProduct.execute(productToSave);
      }
      toast.success('Producto guardado con éxito.');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('No se pudo guardar el producto.');
    } finally {
      setIsFormVisible(false);
      setEditingProduct(undefined);
      loadData(searchTerm, currentPage);
    }
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingProduct(undefined);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Gestión de Productos</h1>
        <div className="flex space-x-2">
          <Link href="/ventas" legacyBehavior>
            <a className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1">Ir a Ventas</a>
          </Link>
          <button 
            onClick={handleCreate} 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            + Añadir Producto
          </button>
        </div>
      </header>

      {isFormVisible ? (
        <ProductForm 
          product={editingProduct} 
          onSave={handleSave} 
          onCancel={handleCancel} 
          categories={categories}
        />
      ) : (
        <ProductList
          products={products}
          loading={loading}
          searchTerm={searchTerm}
          totalProducts={totalProducts}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          onSearchTermChange={handleSearchChange}
          onPageChange={setCurrentPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
