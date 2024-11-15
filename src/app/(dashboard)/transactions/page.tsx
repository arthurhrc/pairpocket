"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate, getCurrentMonth } from "@/lib/utils";
import { useToast } from "@/components/ui/toaster";
import type { TransactionWithRelations, Category } from "@/types";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().refine((v) => parseFloat(v) > 0, { message: "Valor deve ser positivo" }),
  description: z.string().min(2, "Mínimo 2 caracteres").max(500),
  date: z.string().min(1, "Data obrigatória"),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  isRecurring: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function TransactionsPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<TransactionWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [month, setMonth] = useState(getCurrentMonth());
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "expense", date: new Date().toISOString().split("T")[0] },
  });

  const txType = watch("type");

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ month });
    if (filterType !== "all") params.set("type", filterType);
    if (filterCategory !== "all") params.set("categoryId", filterCategory);
    const res = await fetch(`/api/transactions?${params}`);
    if (res.ok) setTransactions(await res.json());
    setLoading(false);
  }, [month, filterType, filterCategory]);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, amount: parseFloat(data.amount) }),
    });
    if (res.ok) {
      reset({ type: "expense", date: new Date().toISOString().split("T")[0] });
      setDialogOpen(false);
      loadTransactions();
      toast({ title: "Transação salva!", variant: "success" });
    }
    setSubmitting(false);
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;
    await fetch(`/api/transactions/${confirmDeleteId}`, { method: "DELETE" });
    setConfirmDeleteId(null);
    loadTransactions();
    toast({ title: "Transação excluída", variant: "success" });
  }

  const incomeCategories = useMemo(() => categories.filter((c) => c.color === "#22c55e"), [categories]);
  const expenseCategories = useMemo(() => categories.filter((c) => c.color !== "#22c55e"), [categories]);
  const filteredCategories = useMemo(() => txType === "income" ? incomeCategories : expenseCategories, [txType, incomeCategories, expenseCategories]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Nova transação</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova transação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Tipo de transação">
                <button type="button" onClick={() => setValue("type", "expense")}
                  aria-pressed={txType === "expense"}
                  className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${txType === "expense" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 text-gray-600"}`}>
                  📉 Despesa
                </button>
                <button type="button" onClick={() => setValue("type", "income")}
                  aria-pressed={txType === "income"}
                  className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${txType === "income" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600"}`}>
                  📈 Receita
                </button>
              </div>
              <div className="space-y-1.5">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" placeholder="0,00" {...register("amount")} />
                {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Descrição</Label>
                <Input placeholder="Ex: Mercado semanal" {...register("description")} />
                {errors.description && <p className="text-xs text-red-500">Descrição obrigatória</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Data</Label>
                <Input type="date" {...register("date")} />
              </div>
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select onValueChange={(v) => setValue("categoryId", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {(filteredCategories.length ? filteredCategories : categories).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-xs text-red-500">Selecione uma categoria</p>}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="recurring" {...register("isRecurring")} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                <Label htmlFor="recurring" className="cursor-pointer">Despesa recorrente (mensal)</Label>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar transação"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{transactions.length} transação(ões)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-lg">Nenhuma transação encontrada</p>
              <p className="text-sm mt-1">Adicione sua primeira transação clicando no botão acima</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className={`flex items-center justify-between rounded-xl border-l-4 px-4 py-3 ${tx.type === "income" ? "border-l-green-500 bg-green-50/30" : "border-l-red-500 bg-red-50/30"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{tx.category.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                        {tx.isRecurring && <Badge variant="secondary" className="text-xs">🔄 Recorrente</Badge>}
                      </div>
                      <p className="text-xs text-gray-400">{tx.category.name} • {formatDate(tx.date)} • {tx.user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                    <button
                      onClick={() => setConfirmDeleteId(tx.id)}
                      aria-label={`Excluir transação ${tx.description}`}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar exclusão
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. A transação será removida permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
