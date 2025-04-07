"use client";

import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatCurrency, getCurrentMonth, getMonthLabel } from "@/lib/utils";

function getMotivation(progress: number) {
  if (progress < 0) return { emoji: "⚠️", text: "Saldo negativo este mês. Hora de revisar os gastos!" };
  if (progress >= 100) return { emoji: "🎉", text: "Meta atingida! Parabéns, vocês arrasaram!" };
  if (progress >= 80) return { emoji: "🏆", text: "Quase lá! Estão indo muito bem juntos!" };
  if (progress >= 50) return { emoji: "💪", text: "Na metade do caminho. Continue assim!" };
  if (progress >= 30) return { emoji: "🌱", text: "Bom começo! Todo pouquinho conta." };
  return { emoji: "🚀", text: "Hora de começar! Cada real guardado é um passo a mais." };
}

export default function GoalsPage() {
  const [dashboardData, setDashboardData] = useState<{ totalIncome: number; totalExpense: number; balance: number } | null>(null);
  const [goal, setGoal] = useState<number | null>(null);
  const [forecast, setForecast] = useState<{ avgMonthlySaving: number; trend: "up" | "down" | "neutral" } | null>(null);
  const [inputGoal, setInputGoal] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const month = getCurrentMonth();

  useEffect(() => {
    fetch(`/api/dashboard?month=${month}`).then((r) => r.json()).then(setDashboardData);
    fetch(`/api/goals?month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.targetAmount) setGoal(data.targetAmount);
        if (data?.forecast) setForecast(data.forecast);
      });
  }, [month]);

  async function saveGoal() {
    const value = parseFloat(inputGoal);
    if (isNaN(value) || value <= 0) return;
    setSaving(true);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetAmount: value, month }),
    });
    if (res.ok) {
      setGoal(value);
      setDialogOpen(false);
      setInputGoal("");
    }
    setSaving(false);
  }

  const savings = dashboardData?.balance ?? 0;
  const progress = goal ? Math.min(100, (savings / goal) * 100) : 0;
  const motivation = getMotivation(progress);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Metas</h1>
        <p className="text-sm text-gray-500">{getMonthLabel(month)}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Meta de economia do mês</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Target className="h-4 w-4 mr-1" />
                  {goal ? "Alterar meta" : "Definir meta"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Definir meta de economia</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="goal-input">Quanto vocês querem guardar este mês?</Label>
                    <Input
                      id="goal-input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ex: 1000"
                      value={inputGoal}
                      onChange={(e) => setInputGoal(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <Button className="w-full" onClick={saveGoal} disabled={saving}>
                    {saving ? "Salvando..." : "Salvar meta"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {goal ? (
            <>
              <div className="text-center py-4">
                <p className="text-3xl sm:text-5xl mb-2">{motivation.emoji}</p>
                <p className="text-gray-600">{motivation.text}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Economizado</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(savings)} de {formatCurrency(goal)}</span>
                </div>
                <Progress
                  value={Math.max(0, progress)}
                  indicatorClassName={progress >= 100 ? "bg-green-500" : progress >= 50 ? "bg-indigo-500" : "bg-amber-500"}
                />
                <p className="text-right text-xs text-gray-400">{Math.max(0, progress).toFixed(0)}%</p>
              </div>
              {forecast && forecast.avgMonthlySaving > 0 && (
                <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
                  <p className="text-sm text-indigo-800">
                    {forecast.trend === "up" && "📈 "}
                    {forecast.trend === "down" && "📉 "}
                    {forecast.trend === "neutral" && "📊 "}
                    Com base nos últimos 3 meses, vocês economizam em média{" "}
                    <span className="font-semibold">{formatCurrency(forecast.avgMonthlySaving)}/mês</span>.
                    {goal && goal > 0 && forecast.avgMonthlySaving > 0 && (
                      <>
                        {" "}
                        {forecast.avgMonthlySaving >= goal
                          ? "Nesse ritmo, a meta está ao alcance!"
                          : `Para atingir a meta, aumentem a economia em ${formatCurrency(goal - forecast.avgMonthlySaving)}/mês.`}
                      </>
                    )}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-3 sm:gap-4">
                <div className="text-center rounded-xl bg-green-50 p-3">
                  <p className="text-xs text-gray-500">Receitas</p>
                  <p className="font-bold text-green-600 text-sm mt-1">{formatCurrency(dashboardData?.totalIncome ?? 0)}</p>
                </div>
                <div className="text-center rounded-xl bg-red-50 p-3">
                  <p className="text-xs text-gray-500">Despesas</p>
                  <p className="font-bold text-red-600 text-sm mt-1">{formatCurrency(dashboardData?.totalExpense ?? 0)}</p>
                </div>
                <div className="text-center rounded-xl bg-indigo-50 p-3">
                  <p className="text-xs text-gray-500">Falta</p>
                  <p className="font-bold text-indigo-600 text-sm mt-1">{formatCurrency(Math.max(0, goal - savings))}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhuma meta definida</p>
              <p className="text-sm mt-1">Defina quanto vocês querem guardar este mês</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
