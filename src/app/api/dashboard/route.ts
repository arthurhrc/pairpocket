import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json({ error: "Sem casal" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || getCurrentMonth();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return NextResponse.json({ error: "Mês inválido" }, { status: 400 });
  }
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

  const categoryAverages = await getCategoryAverages(session.user.coupleId, year, m);

  const byCategory = Object.entries(categoryMap).map(([id, data]) => {
    const avg = categoryAverages[id] ?? 0;
    const isOverspending = avg > 0 && data.total > avg * 1.2;
    return {
      categoryId: id,
      ...data,
      percentage: totalExpense > 0 ? (data.total / totalExpense) * 100 : 0,
      monthlyAvg: avg,
      isOverspending,
    };
  }).sort((a, b) => b.total - a.total);

  const monthlyData = await getMonthlyData(session.user.coupleId, year, m);
  const insights = await getSpendingInsights(session.user.coupleId, year, m, totalIncome, totalExpense, byCategory);

  const recentTransactions = transactions.slice(0, 5);

  const partnerMap: Record<string, { name: string; expense: number; income: number }> = {};
  for (const tx of transactions) {
    if (!partnerMap[tx.userId]) partnerMap[tx.userId] = { name: tx.user.name, expense: 0, income: 0 };
    if (tx.type === "expense") partnerMap[tx.userId].expense += tx.amount;
    else partnerMap[tx.userId].income += tx.amount;
  }
  const byPartner = Object.entries(partnerMap).map(([id, d]) => ({ userId: id, ...d }));

  return NextResponse.json({
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    byCategory,
    byPartner,
    monthlyData,
    recentTransactions,
    insights,
  });
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

async function getCategoryAverages(coupleId: string, year: number, currentMonth: number) {
  const months: { year: number; month: number }[] = [];
  for (let i = 3; i >= 1; i--) {
    let mo = currentMonth - i;
    let y = year;
    if (mo <= 0) { mo += 12; y -= 1; }
    months.push({ year: y, month: mo });
  }
  const oldest = months[0];
  const rangeStart = new Date(oldest.year, oldest.month - 1, 1);
  const rangeEnd = new Date(year, currentMonth - 1, 1);

  const txs = await prisma.transaction.findMany({
    where: { coupleId, date: { gte: rangeStart, lt: rangeEnd }, type: "expense" },
    select: { categoryId: true, amount: true },
  });

  const totals: Record<string, number> = {};
  for (const tx of txs) {
    totals[tx.categoryId] = (totals[tx.categoryId] ?? 0) + tx.amount;
  }
  const result: Record<string, number> = {};
  for (const [id, total] of Object.entries(totals)) {
    result[id] = total / 3;
  }
  return result;
}

async function getSpendingInsights(
  coupleId: string,
  year: number,
  currentMonth: number,
  currentIncome: number,
  currentExpense: number,
  byCategory: { categoryId: string; name: string; icon: string; total: number }[]
) {
  let prevMonth = currentMonth - 1;
  let prevYear = year;
  if (prevMonth <= 0) { prevMonth = 12; prevYear -= 1; }

  const prevStart = new Date(prevYear, prevMonth - 1, 1);
  const prevEnd = new Date(prevYear, prevMonth, 1);

  const prevTxs = await prisma.transaction.findMany({
    where: { coupleId, date: { gte: prevStart, lt: prevEnd }, type: "expense" },
    select: { categoryId: true, amount: true },
  });

  const prevExpense = prevTxs.reduce((s, t) => s + t.amount, 0);
  const prevCategoryMap: Record<string, number> = {};
  for (const tx of prevTxs) {
    prevCategoryMap[tx.categoryId] = (prevCategoryMap[tx.categoryId] ?? 0) + tx.amount;
  }

  const expenseDiff = prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense) * 100 : null;

  const topCategory = byCategory[0] ?? null;
  const topCategoryPrevAmount = topCategory ? (prevCategoryMap[topCategory.categoryId] ?? 0) : 0;
  const topCategoryDiff =
    topCategory && topCategoryPrevAmount > 0
      ? ((topCategory.total - topCategoryPrevAmount) / topCategoryPrevAmount) * 100
      : null;

  const prevIncomeTxs = await prisma.transaction.findMany({
    where: { coupleId, date: { gte: prevStart, lt: prevEnd }, type: "income" },
    select: { amount: true },
  });
  const prevTotalIncome = prevIncomeTxs.reduce((s: number, t: { amount: number }) => s + t.amount, 0);
  const incomeDiff =
    prevTotalIncome > 0
      ? Math.round(((currentIncome - prevTotalIncome) / prevTotalIncome) * 100)
      : null;

  return {
    expenseDiff: expenseDiff !== null ? Math.round(expenseDiff) : null,
    prevMonthExpense: prevExpense,
    prevMonthIncome: prevTotalIncome,
    incomeDiff,
    topCategory: topCategory
      ? {
          name: topCategory.name,
          icon: topCategory.icon,
          total: topCategory.total,
          diff: topCategoryDiff !== null ? Math.round(topCategoryDiff) : null,
        }
      : null,
  };
}

async function getMonthlyData(coupleId: string, year: number, currentMonth: number) {
  const months: { year: number; month: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    let y = year;
    if (m <= 0) { m += 12; y -= 1; }
    months.push({ year: y, month: m });
  }

  const oldest = months[0];
  const rangeStart = new Date(oldest.year, oldest.month - 1, 1);
  const rangeEnd = new Date(year, currentMonth, 1);

  const allTxs = await prisma.transaction.findMany({
    where: { coupleId, date: { gte: rangeStart, lt: rangeEnd } },
    select: { type: true, amount: true, date: true },
  });

  return months.map(({ year: y, month: mo }) => {
    const start = new Date(y, mo - 1, 1).getTime();
    const end = new Date(y, mo, 1).getTime();
    const txs = allTxs.filter((t) => {
      const d = new Date(t.date).getTime();
      return d >= start && d < end;
    });
    const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(y, mo - 1));
    return { month: `${y}-${String(mo).padStart(2, "0")}`, label, income, expense };
  });
}
