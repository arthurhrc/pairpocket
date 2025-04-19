import type { TransactionWithRelations } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export function exportTransactionsToCSV(
  transactions: TransactionWithRelations[],
  month: string
): void {
  const header = ["Data", "Tipo", "Categoria", "Descrição", "Valor", "Responsável"];
  const rows = transactions.map((tx) => [
    formatDate(tx.date),
    tx.type === "income" ? "Receita" : "Despesa",
    tx.category.name,
    `"${tx.description.replace(/"/g, '""')}"`,
    tx.type === "expense" ? `-${formatCurrency(tx.amount)}` : formatCurrency(tx.amount),
    tx.user.name,
  ]);

  const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pairpocket-relatorio-${month}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportSummaryToCSV(
  month: string,
  totalIncome: number,
  totalExpense: number,
  balance: number,
  byCategory: { name: string; total: number; percentage: number }[]
): void {
  const lines: string[][] = [
    ["Relatório Mensal PairPocket", month],
    [],
    ["Resumo"],
    ["Receitas", formatCurrency(totalIncome)],
    ["Despesas", formatCurrency(totalExpense)],
    ["Saldo", formatCurrency(balance)],
    [],
    ["Despesas por categoria"],
    ["Categoria", "Total", "Percentual"],
    ...byCategory.map((c) => [c.name, formatCurrency(c.total), `${c.percentage.toFixed(1)}%`]),
  ];

  const csv = lines.map((r) => r.join(";")).join("\n");
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pairpocket-resumo-${month}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
