'use client';

import { SaleWithDetails } from '@/domain/repositories/ISaleRepository';
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TopProductsChartProps {
  sales: SaleWithDetails[];
}

const TOP_N = 5; // Show top 5 products

export const TopProductsChart = ({ sales }: TopProductsChartProps) => {
  const chartData = useMemo(() => {
    if (!sales || sales.length === 0) return [];

    const productQuantities = sales
      .flatMap(sale => sale.sale_details)
      .reduce((acc, detail) => {
        const productName = detail.products?.name || 'Desconocido';
        if (!acc[productName]) {
          acc[productName] = { name: productName, cantidad: 0 };
        }
        acc[productName].cantidad += detail.quantity;
        return acc;
      }, {} as Record<string, { name: string; cantidad: number }>);

    return Object.values(productQuantities)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, TOP_N);
  }, [sales]);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No hay suficientes datos para mostrar los productos más vendidos.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={150} />
        <Tooltip 
          formatter={(value: number) => [value, 'Unidades vendidas']}
        />
        <Legend />
        <Bar dataKey="cantidad" name="Unidades Vendidas" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};
