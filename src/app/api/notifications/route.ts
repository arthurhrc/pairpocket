import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentMonth } from "@/lib/utils";

export interface AppNotification {
  id: string;
  type: "recurring" | "goal" | "overspending";
  title: string;
  message: string;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json([], { status: 200 });

  const month = getCurrentMonth();
  const [year, m] = month.split("-").map(Number);
  const startDate = new Date(year, m - 1, 1);
  const endDate = new Date(year, m, 1);
  const notifications: AppNotification[] = [];

  // Recurring expenses not registered this month
  const lastMonth = m === 1 ? 12 : m - 1;
  const lastMonthYear = m === 1 ? year - 1 : year;
  const lastStart = new Date(lastMonthYear, lastMonth - 1, 1);
  const lastEnd = new Date(lastMonthYear, lastMonth, 1);

  const recurringLast = await prisma.transaction.findMany({
    where: { coupleId: session.user.coupleId, isRecurring: true, date: { gte: lastStart, lt: lastEnd } },
    select: { description: true, categoryId: true, amount: true, type: true },
  });

  const currentDescriptions = await prisma.transaction.findMany({
    where: { coupleId: session.user.coupleId, isRecurring: true, date: { gte: startDate, lt: endDate } },
    select: { description: true },
  });
  const currentSet = new Set(currentDescriptions.map((t) => t.description.toLowerCase()));

  for (const tx of recurringLast) {
    if (!currentSet.has(tx.description.toLowerCase())) {
      notifications.push({
        id: `recurring-${tx.categoryId}`,
        type: "recurring",
        title: "Despesa recorrente pendente",
        message: `"${tx.description}" não foi lançada neste mês ainda.`,
      });
      if (notifications.filter((n) => n.type === "recurring").length >= 3) break;
    }
  }

  // Goal progress warning
  const goal = await prisma.goal.findUnique({
    where: { coupleId_month: { coupleId: session.user.coupleId, month } },
  });

  if (goal) {
    const txs = await prisma.transaction.findMany({
      where: { coupleId: session.user.coupleId, date: { gte: startDate, lt: endDate } },
      select: { type: true, amount: true },
    });
    const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const savings = income - expense;
    const progress = goal.targetAmount > 0 ? (savings / goal.targetAmount) * 100 : 0;

    const today = new Date();
    const daysInMonth = new Date(year, m, 0).getDate();
    const dayOfMonth = today.getDate();
    const monthProgress = dayOfMonth / daysInMonth;

    if (monthProgress > 0.5 && progress < 30) {
      notifications.push({
        id: "goal-warning",
        type: "goal",
        title: "Meta em risco",
        message: `Vocês estão em ${progress.toFixed(0)}% da meta de economia. Ainda dá tempo!`,
      });
    } else if (progress >= 100) {
      notifications.push({
        id: "goal-achieved",
        type: "goal",
        title: "Meta atingida!",
        message: "Parabéns! Vocês atingiram a meta de economia deste mês.",
      });
    }
  }

  return NextResponse.json(notifications);
}
