import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const postSchema = z.object({
  targetAmount: z.number().positive().finite().max(999_999_999),
  month: z.string().regex(MONTH_RE),
  name: z.string().min(1).max(100).optional(),
  targetDate: z.string().regex(MONTH_RE).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json({ error: "Sem casal" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  if (!month || !MONTH_RE.test(month)) {
    return NextResponse.json({ error: "Mês inválido" }, { status: 400 });
  }

  const goal = await prisma.goal.findUnique({
    where: { coupleId_month: { coupleId: session.user.coupleId, month } },
  });

  const forecast = await getSavingsForecast(session.user.coupleId, month);

  return NextResponse.json(goal ? { ...goal, forecast } : { forecast });
}

async function getSavingsForecast(coupleId: string, month: string) {
  const [year, m] = month.split("-").map(Number);

  const months: { year: number; month: number }[] = [];
  for (let i = 3; i >= 1; i--) {
    let mo = m - i;
    let y = year;
    if (mo <= 0) { mo += 12; y -= 1; }
    months.push({ year: y, month: mo });
  }

  const oldest = months[0];
  const rangeStart = new Date(oldest.year, oldest.month - 1, 1);
  const rangeEnd = new Date(year, m - 1, 1);

  const txs = await prisma.transaction.findMany({
    where: { coupleId, date: { gte: rangeStart, lt: rangeEnd } },
    select: { type: true, amount: true, date: true },
  });

  const monthlySavings = months.map(({ year: y, month: mo }) => {
    const start = new Date(y, mo - 1, 1).getTime();
    const end = new Date(y, mo, 1).getTime();
    const slice = txs.filter((t) => {
      const d = new Date(t.date).getTime();
      return d >= start && d < end;
    });
    const income = slice.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = slice.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return income - expense;
  });

  const validMonths = monthlySavings.filter((s) => s > 0);
  if (validMonths.length === 0) return { avgMonthlySaving: 0, trend: "neutral" as const };

  const avg = validMonths.reduce((s, v) => s + v, 0) / validMonths.length;

  let trend: "up" | "down" | "neutral" = "neutral";
  if (monthlySavings.length >= 2) {
    const last = monthlySavings[monthlySavings.length - 1];
    const prev = monthlySavings[monthlySavings.length - 2];
    if (last > prev * 1.05) trend = "up";
    else if (last < prev * 0.95) trend = "down";
  }

  return { avgMonthlySaving: Math.round(avg), trend };
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json({ error: "Sem casal" }, { status: 404 });

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const { targetAmount, month, name, targetDate } = parsed.data;

  const goal = await prisma.goal.upsert({
    where: { coupleId_month: { coupleId: session.user.coupleId, month } },
    update: { targetAmount, ...(name !== undefined && { name }), ...(targetDate !== undefined && { targetDate }) },
    create: { targetAmount, month, coupleId: session.user.coupleId, name: name ?? null, targetDate: targetDate ?? null },
  });

  return NextResponse.json(goal);
}
