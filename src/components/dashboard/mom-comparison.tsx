"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface MoMData {
  currentIncome: number;
  currentExpense: number;
  prevMonthIncome: number;
  prevMonthExpense: number;
  expenseDiff: number | null;
}

function DiffBadge({ diff }: { diff: number | null }) {
  if (diff === null) return <span className="text-xs text-gray-400">sem histórico</span>;
  if (diff === 0) return (
    <span className="flex items-center gap-0.5 text-xs text-gray-500">
      <Minus className="h-3 w-3" /> igual
    </span>
  );
  const up = diff > 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? "text-red-600" : "text-green-600"}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? "+" : ""}{diff}%
    </span>
  );
}

export function MoMComparison({ data }: { data: MoMData }) {
  const incomeDiff = data.prevMonthIncome > 0
    ? Math.round(((data.currentIncome - data.prevMonthIncome) / data.prevMonthIncome) * 100)
    : null;

  const balanceCurrent = data.currentIncome - data.currentExpense;
  const balancePrev = data.prevMonthIncome - data.prevMonthExpense;
  const balanceDiff = balancePrev !== 0
    ? Math.round(((balanceCurrent - balancePrev) / Math.abs(balancePrev)) * 100)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativo com mês anterior</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {[
            { label: "Receitas", current: data.currentIncome, prev: data.prevMonthIncome, diff: incomeDiff, color: "text-green-600" },
            { label: "Despesas", current: data.currentExpense, prev: data.prevMonthExpense, diff: data.expenseDiff, color: "text-red-600" },
            { label: "Saldo", current: balanceCurrent, prev: balancePrev, diff: balanceDiff, color: balanceCurrent >= 0 ? "text-indigo-600" : "text-red-600" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1 px-4 py-2 text-center">
              <span className="text-xs text-gray-500">{item.label}</span>
              <span className={`text-base font-bold ${item.color}`}>{formatCurrency(item.current)}</span>
              <DiffBadge diff={item.diff} />
              {item.prev > 0 && (
                <span className="text-[11px] text-gray-400">ant: {formatCurrency(item.prev)}</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
