import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  description: z.string().min(2).max(500).optional(),
  amount: z.number().positive().finite().optional(),
  date: z.string().optional(),
  categoryId: z.string().optional(),
});

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx || tx.coupleId !== session.user.coupleId) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx || tx.coupleId !== session.user.coupleId) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  if (parsed.data.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: parsed.data.categoryId, coupleId: session.user.coupleId },
    });
    if (!category) return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      ...(parsed.data.description && { description: parsed.data.description }),
      ...(parsed.data.amount && { amount: parsed.data.amount }),
      ...(parsed.data.date && { date: new Date(parsed.data.date) }),
      ...(parsed.data.categoryId && { categoryId: parsed.data.categoryId }),
    },
    include: {
      user: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
  });

  return NextResponse.json(updated);
}
