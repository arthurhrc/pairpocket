import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/transactions", "/categories", "/goals"];
const AUTH_API_PATHS = ["/api/auth/login", "/api/auth/register"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session_token")?.value;
  const isProtected = PROTECTED_PATHS.some((p) => req.nextUrl.pathname.startsWith(p));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const method = req.method;
  const path = req.nextUrl.pathname;
  if (
    method !== "GET" &&
    method !== "HEAD" &&
    path.startsWith("/api") &&
    !AUTH_API_PATHS.some((p) => path.startsWith(p))
  ) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
