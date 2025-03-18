import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const postSchema = z.object({
  targetAmount: z.number().positive().finite().max(999_999_999),
  month: z.string().regex(MONTH_RE),
});

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json({ error: "Sem casal" }, { status: 404 });

  const month = new URL(req.url).searchParams.get("month");
  if (!month || !MONTH_RE.test(month)) {
    return NextResponse.json({ error: "Mês inválido" }, { status: 400 });
  }

  const goal = await prisma.goal.findUnique({
    where: { coupleId_month: { coupleId: session.user.coupleId, month } },
  });

  return NextResponse.json(goal ?? null);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json({ error: "Sem casal" }, { status: 404 });

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const { targetAmount, month } = parsed.data;

  const goal = await prisma.goal.upsert({
    where: { coupleId_month: { coupleId: session.user.coupleId, month } },
    update: { targetAmount },
    create: { targetAmount, month, coupleId: session.user.coupleId },
  });

  return NextResponse.json(goal);
}
