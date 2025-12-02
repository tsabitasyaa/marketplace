import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logout success" });

  res.cookies.set("adminToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0), // hapus cookie
  });

  return res;
}
