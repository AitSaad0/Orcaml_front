import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Routes protégées (token obligatoire) ─────────────────────────────────────
const PROTECTED = ["/", "/projects", "/dashboard", "/settings", "/models"];

// ─── Routes auth-only (inaccessibles si déjà connecté) ───────────────────────
const AUTH_ONLY = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("orcaml_token")?.value;
  const path  = request.nextUrl.pathname;

  const isProtected = PROTECTED.some((r) => path === r || (r !== "/" && path.startsWith(r)));
  const isAuthOnly  = AUTH_ONLY.some((r) => path.startsWith(r));

  // Pas connecté + page protégée → /login
  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", path);
    return NextResponse.redirect(loginUrl);
  }

  // Déjà connecté + page login/register → /projects
  if (isAuthOnly && token) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo).*)"],
};