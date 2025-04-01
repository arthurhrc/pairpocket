"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HealthScoreProps {
  score: number;
  label: string;
  breakdown: { label: string; points: number; max: number }[];
}

function getScoreColor(score: number) {
  if (score >= 80) return { ring: "stroke-green-500", text: "text-green-600", bg: "bg-green-50", badge: "bg-green-100 text-green-700" };
  if (score >= 50) return { ring: "stroke-amber-500", text: "text-amber-600", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700" };
  return { ring: "stroke-red-500", text: "text-red-600", bg: "bg-red-50", badge: "bg-red-100 text-red-700" };
}

export function HealthScoreCard({ score, label, breakdown }: HealthScoreProps) {
  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saúde financeira</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative flex-shrink-0">
            <svg width="100" height="100" className="-rotate-90">
              <circle cx="50" cy="50" r="36" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={`${colors.ring} transition-all duration-700`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
              <span className="text-xs text-gray-400">/100</span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-3">
            <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}>
              {label}
            </div>
            <div className="space-y-2">
              {breakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${colors.ring.replace("stroke-", "bg-")}`}
                        style={{ width: `${(item.points / item.max) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-gray-400">
                      {item.points}/{item.max}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function computeHealthScore(
  totalIncome: number,
  totalExpense: number,
  expenseDiff: number | null
): { score: number; label: string; breakdown: { label: string; points: number; max: number }[] } {
  let savingsPoints = 0;
  const savingsRate = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0;
  if (savingsRate >= 0.3) savingsPoints = 40;
  else if (savingsRate >= 0.15) savingsPoints = 30;
  else if (savingsRate >= 0.05) savingsPoints = 20;
  else if (savingsRate > 0) savingsPoints = 10;

  let trendPoints = 0;
  if (expenseDiff !== null) {
    if (expenseDiff <= -10) trendPoints = 30;
    else if (expenseDiff <= 0) trendPoints = 20;
    else if (expenseDiff <= 10) trendPoints = 15;
    else if (expenseDiff <= 20) trendPoints = 10;
    else trendPoints = 0;
  } else {
    trendPoints = 20;
  }

  const balancePoints = totalIncome > 0 && totalExpense <= totalIncome ? 30 : 0;

  const score = savingsPoints + trendPoints + balancePoints;

  let label = "Atenção";
  if (score >= 80) label = "Excelente";
  else if (score >= 60) label = "Bom";
  else if (score >= 40) label = "Regular";

  return {
    score,
    label,
    breakdown: [
      { label: "Taxa de economia", points: savingsPoints, max: 40 },
      { label: "Tendência de gastos", points: trendPoints, max: 30 },
      { label: "Saldo positivo", points: balancePoints, max: 30 },
    ],
  };
}
