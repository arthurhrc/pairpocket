import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readBodyWithLimit, sanitizeString, PayloadTooLargeError } from "@/lib/sanitize";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const postSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive().finite().max(999_999_999),
  description: z.string().min(2).max(200).transform(sanitizeString),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  categoryId: z.string().uuid(),
  isRecurring: z.boolean().optional(),
  splitRatio: z.number().min(0).max(1).nullable().optional(),
});

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
    if (!MONTH_RE.test(month)) {
      return NextResponse.json({ error: "Formato de mês inválido" }, { status: 400 });
    }
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

  let body: unknown;
  try {
    body = await readBodyWithLimit(req);
  } catch (e) {
    if (e instanceof PayloadTooLargeError) {
      return NextResponse.json({ error: "Requisição muito grande" }, { status: 413 });
    }
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const { type, amount, description, date, categoryId, isRecurring, splitRatio } = parsed.data;

  const category = await prisma.category.findFirst({
    where: { id: categoryId, coupleId: session.user.coupleId },
  });
  if (!category) return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });

  const transaction = await prisma.transaction.create({
    data: {
      type,
      amount,
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
