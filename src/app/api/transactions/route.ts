import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json({ error: "Sem casal" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const type = searchParams.get("type");
  const categoryId = searchParams.get("categoryId");

  const where: Record<string, unknown> = { coupleId: session.user.coupleId };

  if (month) {
    const [year, m] = month.split("-").map(Number);
    where.date = {
      gte: new Date(year, m - 1, 1),
      lt: new Date(year, m, 1),
    };
  }
  if (type && type !== "all") where.type = type;
  if (categoryId) where.categoryId = categoryId;

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      user: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json({ error: "Sem casal" }, { status: 404 });

  const body = await req.json();
  const { type, amount, description, date, categoryId, isRecurring, splitRatio } = body;

  if (!type || !amount || !description || !date || !categoryId) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const category = await prisma.category.findFirst({
    where: { id: categoryId, coupleId: session.user.coupleId },
  });
  if (!category) return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });

  const transaction = await prisma.transaction.create({
    data: {
      type,
      amount: parseFloat(amount),
      description,
      date: new Date(date),
      categoryId,
      coupleId: session.user.coupleId,
      userId: session.user.id,
      isRecurring: isRecurring ?? false,
      splitRatio: splitRatio ?? null,
    },
    include: {
      user: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}
