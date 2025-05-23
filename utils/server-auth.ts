/**
 * Server-side authentication utilities
 */
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "unoform-kitchen-design-secret-key-2024"
);

export interface TokenPayload {
  username: string;
  exp: number;
}

/**
 * Verify JWT token and return payload
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Type guard to ensure payload has required fields
    if (!payload.username || typeof payload.username !== 'string') {
      throw new Error("Invalid token payload");
    }
    
    return {
      username: payload.username,
      exp: payload.exp as number
    };
  } catch (error) {
    throw new Error("Invalid token");
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  return authHeader.replace("Bearer ", "");
}