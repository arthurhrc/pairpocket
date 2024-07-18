import { describe, it, expect } from "vitest";

describe("Dashboard calculations", () => {
  function calcBalance(income: number, expense: number) {
    return income - expense;
  }

  function calcProgress(saved: number, goal: number) {
    return Math.min(100, (saved / goal) * 100);
  }

  function categorySummary(transactions: { type: string; amount: number; categoryId: string }[]) {
    const expenses = transactions.filter((t) => t.type === "expense");
    const total = expenses.reduce((s, t) => s + t.amount, 0);
    const byCategory: Record<string, number> = {};
    for (const tx of expenses) {
      byCategory[tx.categoryId] = (byCategory[tx.categoryId] || 0) + tx.amount;
    }
    return Object.entries(byCategory).map(([id, amount]) => ({
      categoryId: id,
      total: amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }));
  }

  it("calcula saldo corretamente", () => {
    expect(calcBalance(10000, 6000)).toBe(4000);
    expect(calcBalance(3000, 5000)).toBe(-2000);
  });

  it("calcula progresso da meta com máximo de 100%", () => {
    expect(calcProgress(500, 1000)).toBe(50);
    expect(calcProgress(1500, 1000)).toBe(100);
    expect(calcProgress(0, 1000)).toBe(0);
  });

  it("agrupa despesas por categoria e exclui receitas", () => {
    const txs = [
      { type: "expense", amount: 300, categoryId: "cat1" },
      { type: "expense", amount: 200, categoryId: "cat2" },
      { type: "income", amount: 1000, categoryId: "cat3" },
      { type: "expense", amount: 100, categoryId: "cat1" },
    ];
    const summary = categorySummary(txs);
    const cat1 = summary.find((s) => s.categoryId === "cat1");
    const cat3 = summary.find((s) => s.categoryId === "cat3");

    expect(cat1?.total).toBe(400);
    expect(cat1?.percentage).toBeCloseTo(66.67, 1);
    expect(cat3).toBeUndefined();
  });
});
