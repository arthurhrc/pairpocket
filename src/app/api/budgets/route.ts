import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentMonth } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json({ error: "Sem casal" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || getCurrentMonth();

  const budgets = await prisma.budget.findMany({
    where: { coupleId: session.user.coupleId, month },
    include: { category: true },
  });

  return NextResponse.json(budgets);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json({ error: "Sem casal" }, { status: 404 });

  const { categoryId, month, limitAmount } = await req.json();
  if (!categoryId || !month || !limitAmount) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const budget = await prisma.budget.upsert({
    where: { coupleId_categoryId_month: { coupleId: session.user.coupleId, categoryId, month } },
    update: { limitAmount: parseFloat(limitAmount) },
    create: { coupleId: session.user.coupleId, categoryId, month, limitAmount: parseFloat(limitAmount) },
    include: { category: true },
  });

  return NextResponse.json(budget);
}
