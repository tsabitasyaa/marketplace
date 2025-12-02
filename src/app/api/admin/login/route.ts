import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // contoh validasi
  if (email !== "admin@example.com" || password !== "admin123") {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ message: "Login success" });

  res.cookies.set("adminToken", "SOME_RANDOM_TOKEN_VALUE", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 hari
  });

  return res;
}
