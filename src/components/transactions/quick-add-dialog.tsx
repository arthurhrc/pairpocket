"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toaster";
import type { Category } from "@/types";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().refine((v) => parseFloat(v) > 0, { message: "Valor deve ser positivo" }),
  description: z.string().min(2, "Mínimo 2 caracteres").max(200),
  date: z.string().min(1, "Data obrigatória"),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  isRecurring: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function QuickAddTransactionDialog({ open, onOpenChange, onSuccess }: Props) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "expense", date: new Date().toISOString().split("T")[0] },
  });
  const txType = watch("type");

  useEffect(() => {
    if (open && categories.length === 0) {
      fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {});
    }
  }, [open, categories.length]);

  const incomeCategories = categories.filter((c) => c.color === "#22c55e");
  const expenseCategories = categories.filter((c) => c.color !== "#22c55e");
  const filteredCategories = txType === "income" ? incomeCategories : expenseCategories;

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, amount: parseFloat(data.amount) }),
    });
    setSubmitting(false);
    if (res.ok) {
      toast({ title: "Transação adicionada!" });
      reset({ type: "expense", date: new Date().toISOString().split("T")[0] });
      onOpenChange(false);
      onSuccess?.();
    } else {
      toast({ title: "Erro ao salvar transação", variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Tipo de transação">
            <button
              type="button"
              onClick={() => setValue("type", "expense")}
              aria-pressed={txType === "expense"}
              className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${txType === "expense" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 text-gray-600"}`}
            >
              📉 Despesa
            </button>
            <button
              type="button"
              onClick={() => setValue("type", "income")}
              aria-pressed={txType === "income"}
              className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${txType === "income" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600"}`}
            >
              📈 Receita
            </button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qa-amount">Valor (R$)</Label>
            <Input id="qa-amount" type="number" step="0.01" inputMode="decimal" placeholder="0,00" {...register("amount")} />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qa-description">Descrição</Label>
            <Input id="qa-description" placeholder="Ex: Mercado semanal" {...register("description")} autoFocus />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qa-date">Data</Label>
            <Input id="qa-date" type="date" {...register("date")} />
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select onValueChange={(v) => setValue("categoryId", v)}>
              <SelectTrigger aria-label="Selecionar categoria">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="px-2 text-xs text-gray-400">
                    {txType === "income" ? "Receitas" : "Despesas"}
                  </SelectLabel>
                  {(filteredCategories.length ? filteredCategories : categories).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-xs text-red-500">Selecione uma categoria</p>}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="qa-recurring" {...register("isRecurring")} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
            <Label htmlFor="qa-recurring" className="cursor-pointer">Despesa recorrente (mensal)</Label>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Salvando..." : "Salvar transação"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
