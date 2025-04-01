import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface InsightsData {
  expenseDiff: number | null;
  prevMonthExpense: number;
  topCategory: {
    name: string;
    icon: string;
    total: number;
    diff: number | null;
  } | null;
}

export function FinancialInsights({ insights }: { insights: InsightsData }) {
  if (!insights.topCategory && insights.expenseDiff === null) return null;

  const { expenseDiff, prevMonthExpense, topCategory } = insights;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do mês</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {expenseDiff !== null && prevMonthExpense > 0 && (
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 px-4 py-3">
            <div className="mt-0.5">
              {expenseDiff > 0 ? (
                <TrendingUp className="h-5 w-5 text-red-500" />
              ) : expenseDiff < 0 ? (
                <TrendingDown className="h-5 w-5 text-green-500" />
              ) : (
                <Minus className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-700">
              {expenseDiff > 0 ? (
                <>
                  Vocês gastaram{" "}
                  <span className="font-semibold text-red-600">{expenseDiff}% a mais</span> do que
                  no mês anterior ({formatCurrency(prevMonthExpense)}).
                </>
              ) : expenseDiff < 0 ? (
                <>
                  Vocês gastaram{" "}
                  <span className="font-semibold text-green-600">
                    {Math.abs(expenseDiff)}% a menos
                  </span>{" "}
                  do que no mês anterior ({formatCurrency(prevMonthExpense)}). Bom trabalho!
                </>
              ) : (
                <>Gastos iguais ao mês anterior ({formatCurrency(prevMonthExpense)}).</>
              )}
            </p>
          </div>
        )}

        {topCategory && (
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 px-4 py-3">
            <span className="mt-0.5 text-xl leading-none">{topCategory.icon}</span>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{topCategory.name}</span> foi a categoria com maior
              gasto: <span className="font-semibold">{formatCurrency(topCategory.total)}</span>.
              {topCategory.diff !== null && topCategory.diff > 10 && (
                <>
                  {" "}
                  Isso representa{" "}
                  <span className="font-semibold text-red-600">{topCategory.diff}% a mais</span> do
                  que no mês passado.
                </>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
