"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface PartnerData {
  userId: string;
  name: string;
  expense: number;
  income: number;
}

interface Props {
  data: PartnerData[];
}

export function PartnerBreakdown({ data }: Props) {
  if (data.length === 0) return null;

  const totalExpense = data.reduce((s, p) => s + p.expense, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por parceiro(a)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((partner) => {
          const pct = totalExpense > 0 ? (partner.expense / totalExpense) * 100 : 0;
          return (
            <div key={partner.userId} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-800">{partner.name}</span>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span className="text-red-600 font-semibold">{formatCurrency(partner.expense)}</span>
                  <span className="text-green-600 font-semibold">+{formatCurrency(partner.income)}</span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${pct.toFixed(1)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">{pct.toFixed(0)}% das despesas</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
