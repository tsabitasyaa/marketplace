import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("adminToken")?.value;

  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/admin";
  const isProtected = pathname.startsWith("/admin/dashboard");

  // Jika belum login tetapi akses halaman protected
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Jika sudah login tetapi buka halaman login
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
