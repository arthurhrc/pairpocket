import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  icon: z.string().min(1).max(8).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json({ error: "Sem casal" }, { status: 404 });

  const { id } = await params;

  const existing = await prisma.category.findFirst({
    where: { id, coupleId: session.user.coupleId },
  });
  if (!existing) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const updated = await prisma.category.update({
    where: { id, coupleId: session.user.coupleId },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json({ error: "Sem casal" }, { status: 404 });

  const { id } = await params;

  const existing = await prisma.category.findFirst({
    where: { id, coupleId: session.user.coupleId },
  });
  if (!existing) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });

  await prisma.category.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
