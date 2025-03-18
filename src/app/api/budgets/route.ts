import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentMonth } from "@/lib/utils";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const postSchema = z.object({
  categoryId: z.string().min(1),
  month: z.string().regex(MONTH_RE),
  limitAmount: z.number().positive().finite(),
});

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json({ error: "Sem casal" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || getCurrentMonth();
  if (!MONTH_RE.test(month)) return NextResponse.json({ error: "Mês inválido" }, { status: 400 });

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

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { categoryId, month, limitAmount } = parsed.data;

  const category = await prisma.category.findFirst({
    where: { id: categoryId, coupleId: session.user.coupleId },
  });
  if (!category) return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });

  const budget = await prisma.budget.upsert({
    where: { coupleId_categoryId_month: { coupleId: session.user.coupleId, categoryId, month } },
    update: { limitAmount },
    create: { coupleId: session.user.coupleId, categoryId, month, limitAmount },
    include: { category: true },
  });

  return NextResponse.json(budget);
}
