import { NextResponse } from "next/server";
import { SignJWT } from "jose";

// Simple credential store - in production, this would be in a database
const VALID_CREDENTIALS = [
  { username: "unoform_admin", password: "UnoKitchen2024!" },
  { username: "design_team", password: "ScandinavianStyle!" },
  { username: "demo_user", password: "KitchenDesign123" }
];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "unoform-kitchen-design-secret-key-2024"
);

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Check credentials
    const user = VALID_CREDENTIALS.find(
      (cred) => cred.username === username && cred.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await new SignJWT({ username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d") // Token expires in 7 days
      .sign(JWT_SECRET);

    return NextResponse.json({ 
      token,
      username,
      message: "Login successful" 
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}