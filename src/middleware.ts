import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/transactions", "/categories", "/goals"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session_token")?.value;
  const isProtected = PROTECTED_PATHS.some((p) => req.nextUrl.pathname.startsWith(p));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
