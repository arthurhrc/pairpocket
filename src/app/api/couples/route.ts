import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_CATEGORIES = [
  { name: "Moradia", icon: "🏠", color: "#6366f1" },
  { name: "Alimentação", icon: "🛒", color: "#f59e0b" },
  { name: "Transporte", icon: "🚗", color: "#3b82f6" },
  { name: "Saúde", icon: "💊", color: "#10b981" },
  { name: "Lazer", icon: "🎬", color: "#ec4899" },
  { name: "Educação", icon: "📚", color: "#8b5cf6" },
  { name: "Serviços", icon: "💡", color: "#06b6d4" },
  { name: "Vestuário", icon: "👕", color: "#f97316" },
  { name: "Pet", icon: "🐾", color: "#84cc16" },
  { name: "Outros", icon: "📦", color: "#6b7280" },
  { name: "Salário", icon: "💰", color: "#22c55e" },
];

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  if (session.user.coupleId) {
    return NextResponse.json({ error: "Já vinculado a um casal" }, { status: 409 });
  }

  const couple = await prisma.couple.create({
    data: {
      members: { connect: { id: session.user.id } },
      categories: {
        create: DEFAULT_CATEGORIES.map((c) => ({ ...c, isDefault: true })),
      },
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { coupleId: couple.id },
  });

  return NextResponse.json({ id: couple.id, inviteCode: couple.inviteCode }, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json({ error: "Sem casal vinculado" }, { status: 404 });

  const couple = await prisma.couple.findUnique({
    where: { id: session.user.coupleId },
    include: { members: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  });

  return NextResponse.json(couple);
}
