import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "./lib/fast-api/user";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    if (isAuthRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const redirectTarget =
    currentUser.role?.toLowerCase() === "cashier" ? "/pos" : "/dashboard";

  if (isAuthRoute) {
    return NextResponse.redirect(new URL(redirectTarget, request.url));
  }

  const isRootRoute = pathname === "/" || pathname === "";
  if (isRootRoute) {
    return NextResponse.redirect(new URL(redirectTarget, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
