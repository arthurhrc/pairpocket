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
  if (progress >= 100) return { emoji: "🎉", text: "Meta atingida! Parabéns, vocês arrasaram!" };
  if (progress >= 80) return { emoji: "🏆", text: "Quase lá! Estão indo muito bem juntos!" };
  if (progress >= 50) return { emoji: "💪", text: "Na metade do caminho. Continue assim!" };
  if (progress >= 30) return { emoji: "🌱", text: "Bom começo! Todo pouquinho conta." };
  return { emoji: "🚀", text: "Hora de começar! Cada real guardado é um passo a mais." };
}

export default function GoalsPage() {
  const [dashboardData, setDashboardData] = useState<{ totalIncome: number; totalExpense: number; balance: number } | null>(null);
  const [goal, setGoal] = useState<number | null>(null);
  const [inputGoal, setInputGoal] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const month = getCurrentMonth();

  useEffect(() => {
    fetch(`/api/dashboard?month=${month}`).then((r) => r.json()).then(setDashboardData);
    const stored = localStorage.getItem(`goal-${month}`);
    if (stored) setGoal(parseFloat(stored));
  }, [month]);

  function saveGoal() {
    const value = parseFloat(inputGoal);
    if (!isNaN(value) && value > 0) {
      setGoal(value);
      localStorage.setItem(`goal-${month}`, String(value));
      setDialogOpen(false);
      setInputGoal("");
    }
  }

  const savings = dashboardData ? Math.max(0, dashboardData.balance) : 0;
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
                    <Label>Quanto vocês querem guardar este mês?</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 1000"
                      value={inputGoal}
                      onChange={(e) => setInputGoal(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" onClick={saveGoal}>Salvar meta</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {goal ? (
            <>
              <div className="text-center py-4">
                <p className="text-5xl mb-2">{motivation.emoji}</p>
                <p className="text-gray-600">{motivation.text}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Economizado</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(savings)} de {formatCurrency(goal)}</span>
                </div>
                <Progress
                  value={progress}
                  indicatorClassName={progress >= 100 ? "bg-green-500" : progress >= 50 ? "bg-indigo-500" : "bg-amber-500"}
                />
                <p className="text-right text-xs text-gray-400">{progress.toFixed(0)}%</p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
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
