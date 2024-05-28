"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpensePieChart, MonthlyBarChart } from "@/components/dashboard/charts";
import { formatCurrency, formatDate, getCurrentMonth, getMonthLabel } from "@/lib/utils";
import type { CategorySummary, MonthlyData, TransactionWithRelations } from "@/types";

interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: CategorySummary[];
  monthlyData: MonthlyData[];
  recentTransactions: TransactionWithRelations[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [month, setMonth] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?month=${month}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [month]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  const balancePositive = data.balance >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">{getMonthLabel(month)}</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Receitas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(data.totalIncome)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Despesas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(data.totalExpense)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${balancePositive ? "border-l-indigo-500" : "border-l-red-500"}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Saldo</p>
                <p className={`text-2xl font-bold ${balancePositive ? "text-indigo-700" : "text-red-600"}`}>
                  {formatCurrency(data.balance)}
                </p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${balancePositive ? "bg-indigo-100" : "bg-red-100"}`}>
                <Wallet className={`h-6 w-6 ${balancePositive ? "text-indigo-600" : "text-red-600"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensePieChart data={data.byCategory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyBarChart data={data.monthlyData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas transações</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentTransactions.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">Nenhuma transação neste período</p>
          ) : (
            <div className="space-y-3">
              {data.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{tx.category.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{tx.category.name}</span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span>{tx.user.name}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={tx.type === "income" ? "income" : "expense"}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
