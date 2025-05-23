import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ 
    message: "Logged out successfully" 
  });

  // Clear the auth cookie
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // Expire immediately
    path: "/"
  });

  return response;
}