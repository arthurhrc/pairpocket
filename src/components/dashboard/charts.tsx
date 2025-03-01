"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { CategorySummary, MonthlyData } from "@/types";

function PieLabel({ categoryName, percentage }: { categoryName?: string; percentage?: number }) {
  if (!categoryName || percentage == null) return null;
  return <>{`${categoryName} ${percentage.toFixed(0)}%`}</>;
}

export function ExpensePieChart({ data }: { data: CategorySummary[] }) {
  if (!data.length) {
    return <div className="flex h-48 items-center justify-center text-sm text-gray-400">Sem despesas no período</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="categoryName"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={(props) => {
            const p = props as unknown as { categoryName?: string; percentage?: number };
            return <PieLabel categoryName={p.categoryName} percentage={p.percentage} />;
          }}
          labelLine={false}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyBarChart({ data }: { data: MonthlyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Legend />
        <Bar dataKey="income" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
