'use client';

import { SaleWithDetails } from '@/domain/repositories/ISaleRepository';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SalesTrendChartProps {
  sales: SaleWithDetails[];
}

const currencyFormatter = (value: number) => formatCurrency(value);

export const SalesTrendChart = ({ sales }: SalesTrendChartProps) => {
  const chartData = useMemo(() => {
    if (!sales || sales.length === 0) return [];

    const dailySales = sales.reduce((acc, sale) => {
      const date = format(new Date(sale.created_at!), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, total: 0 };
      }
      acc[date].total += sale.total;
      return acc;
    }, {} as Record<string, { date: string; total: number }>);

    return Object.values(dailySales).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sales]);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No hay suficientes datos para mostrar el gráfico de tendencias.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date"
          tickFormatter={(str) => format(new Date(str), 'dd MMM', { locale: es })}
        />
        <YAxis tickFormatter={currencyFormatter} />
        <Tooltip 
          labelFormatter={(label) => format(new Date(label), 'eeee, dd MMM yyyy', { locale: es })}
          formatter={(value: number) => [formatCurrency(value), 'Total Ventas']}
        />
        <Legend />
        <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total Ventas (S/)" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};
