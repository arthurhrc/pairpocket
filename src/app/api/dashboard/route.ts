import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json({ error: "Sem casal" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || getCurrentMonth();
  const [year, m] = month.split("-").map(Number);

  const startDate = new Date(year, m - 1, 1);
  const endDate = new Date(year, m, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      coupleId: session.user.coupleId,
      date: { gte: startDate, lt: endDate },
    },
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
      user: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
  });

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const categoryMap: Record<string, { name: string; icon: string; color: string; total: number }> = {};
  for (const tx of transactions.filter((t) => t.type === "expense")) {
    if (!categoryMap[tx.categoryId]) {
      categoryMap[tx.categoryId] = { name: tx.category.name, icon: tx.category.icon, color: tx.category.color, total: 0 };
    }
    categoryMap[tx.categoryId].total += tx.amount;
  }

  const byCategory = Object.entries(categoryMap).map(([id, data]) => ({
    categoryId: id,
    ...data,
    percentage: totalExpense > 0 ? (data.total / totalExpense) * 100 : 0,
  })).sort((a, b) => b.total - a.total);

  const monthlyData = await getMonthlyData(session.user.coupleId, year, m);

  const recentTransactions = transactions.slice(0, 5);

  return NextResponse.json({
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    byCategory,
    monthlyData,
    recentTransactions,
  });
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

async function getMonthlyData(coupleId: string, year: number, currentMonth: number) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    let y = year;
    if (m <= 0) { m += 12; y -= 1; }
    months.push({ year: y, month: m });
  }

  const results = await Promise.all(
    months.map(async ({ year: y, month: mo }) => {
      const start = new Date(y, mo - 1, 1);
      const end = new Date(y, mo, 1);
      const txs = await prisma.transaction.findMany({
        where: { coupleId, date: { gte: start, lt: end } },
        select: { type: true, amount: true },
      });
      const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(y, mo - 1));
      return { month: `${y}-${String(mo).padStart(2, "0")}`, label, income, expense };
    })
  );

  return results;
}
