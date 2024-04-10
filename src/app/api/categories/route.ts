import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json({ error: "Sem casal" }, { status: 404 });

  const categories = await prisma.category.findMany({
    where: { coupleId: session.user.coupleId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.user.coupleId) return NextResponse.json({ error: "Sem casal" }, { status: 404 });

  const { name, icon, color } = await req.json();
  if (!name || !icon || !color) return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });

  const category = await prisma.category.create({
    data: { name, icon, color, coupleId: session.user.coupleId },
  });

  return NextResponse.json(category, { status: 201 });
}
