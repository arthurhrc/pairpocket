import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { inviteCode } = await req.json();
  if (!inviteCode) return NextResponse.json({ error: "Código obrigatório" }, { status: 400 });

  const couple = await prisma.couple.findUnique({
    where: { inviteCode },
    include: { members: true },
  });

  if (!couple) return NextResponse.json({ error: "Código inválido" }, { status: 404 });
  if (couple.members.length >= 2) return NextResponse.json({ error: "Carteira já está completa" }, { status: 409 });
  if (couple.members.some((m) => m.id === session.user.id)) {
    return NextResponse.json({ error: "Você já faz parte desta carteira" }, { status: 409 });
  }

  await prisma.couple.update({
    where: { id: couple.id },
    data: { members: { connect: { id: session.user.id } } },
  });
  await prisma.user.update({
    where: { id: session.user.id },
    data: { coupleId: couple.id },
  });

  return NextResponse.json({ ok: true });
}
