import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { include: { couple: true } } },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) return null;
  return session.user;
}

export function createSessionToken(): string {
  return crypto.randomUUID() + "-" + Date.now();
}
