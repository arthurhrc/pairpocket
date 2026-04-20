import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

const schema = z.object({ inviteCode: z.string().min(1).max(64) });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { allowed, retryAfter } = rateLimit(getRateLimitKey(req, "couple_join"), 10, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em instantes." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Código obrigatório" }, { status: 400 });

  const { inviteCode } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const couple = await tx.couple.findUnique({
        where: { inviteCode },
        include: { members: { select: { id: true } } },
      });

      if (!couple) throw Object.assign(new Error("Código inválido"), { status: 404 });
      if (couple.members.some((m) => m.id === session.user.id)) {
        throw Object.assign(new Error("Você já faz parte desta carteira"), { status: 409 });
      }
      if (couple.members.length >= 2) {
        throw Object.assign(new Error("Carteira já está completa"), { status: 409 });
      }

      await tx.couple.update({
        where: { id: couple.id },
        data: { members: { connect: { id: session.user.id } } },
      });
      await tx.user.update({
        where: { id: session.user.id },
        data: { coupleId: couple.id },
      });
    });
  } catch (e) {
    const err = e as Error & { status?: number };
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 });
  }

  return NextResponse.json({ ok: true });
}
