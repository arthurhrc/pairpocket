"use client";

import Link from "next/link";
import { PlusCircle, Target, LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyDashboardProps {
  onAddTransaction: () => void;
}

const steps = [
  {
    icon: PlusCircle,
    color: "bg-indigo-100 text-indigo-600",
    title: "Adicione uma transação",
    description: "Registre receitas e despesas do casal.",
    action: null as null | string,
    cta: "Adicionar agora",
  },
  {
    icon: Target,
    color: "bg-green-100 text-green-600",
    title: "Defina uma meta de economia",
    description: "Quanto vocês querem guardar este mês?",
    action: "/goals",
    cta: "Definir meta",
  },
  {
    icon: LayoutGrid,
    color: "bg-amber-100 text-amber-600",
    title: "Personalize categorias",
    description: "Organize gastos com categorias do casal.",
    action: "/categories",
    cta: "Ver categorias",
  },
];

export function EmptyDashboard({ onAddTransaction }: EmptyDashboardProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-10">
        <div className="mx-auto max-w-sm text-center">
          <p className="text-4xl mb-3">💕</p>
          <h2 className="text-lg font-bold text-gray-900">Tudo pronto para começar!</h2>
          <p className="mt-1 text-sm text-gray-500 mb-8">
            Vocês ainda não têm transações neste mês. Comece pelo passo 1 abaixo.
          </p>

          <div className="space-y-3 text-left">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${step.color}`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {step.action ? (
                  <Link href={step.action}>
                    <Button variant="outline" size="sm">{step.cta}</Button>
                  </Link>
                ) : (
                  <Button size="sm" onClick={onAddTransaction}>{step.cta}</Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
