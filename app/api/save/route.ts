import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import redis from "../../../utils/redis";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "unoform-kitchen-design-secret-key-2024"
);

interface SavedImage {
  id: string;
  imageUrl: string;
  originalImageUrl?: string;
  prompt: string;
  designSelections?: any;
  timestamp: number;
  type: 'generated' | 'inpainted' | 'variation';
}

async function getUserFromToken(request: Request): Promise<string | null> {
  // Check Authorization header first
  const authHeader = request.headers.get("authorization");
  const tokenFromHeader = authHeader?.replace("Bearer ", "");
  
  // Check cookie as fallback
  const cookieHeader = request.headers.get("cookie");
  let tokenFromCookie: string | null = null;
  
  if (cookieHeader) {
    const cookies = cookieHeader.split("; ");
    const authCookie = cookies.find(c => c.startsWith("auth_token="));
    tokenFromCookie = authCookie ? authCookie.split("=")[1] : null;
  }
  
  const token = tokenFromHeader || tokenFromCookie;
  
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.username as string;
  } catch (error) {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const username = await getUserFromToken(request);
    if (!username) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { imageUrl, originalImageUrl, prompt, designSelections, type = 'generated' } = await request.json();

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: "Image URL and prompt are required" },
        { status: 400 }
      );
    }

    // Create saved image entry
    const savedImage: SavedImage = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageUrl,
      originalImageUrl,
      prompt,
      designSelections,
      timestamp: Date.now(),
      type
    };

    // Save to Redis
    if (redis) {
      const userKey = `user:${username}:saved_images`;
      await redis.lpush(userKey, JSON.stringify(savedImage));
      
      // Keep only the latest 50 saved images per user
      await redis.ltrim(userKey, 0, 49);
    }

    return NextResponse.json({ 
      success: true, 
      id: savedImage.id,
      message: "Design saved successfully" 
    });

  } catch (error) {
    console.error("Save image error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const username = await getUserFromToken(request);
    if (!username) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Retrieve saved images for user
    if (!redis) {
      return NextResponse.json({ images: [] });
    }

    const userKey = `user:${username}:saved_images`;
    const savedImagesStrings = await redis.lrange(userKey, 0, -1);
    
    const savedImages = savedImagesStrings.map(str => {
      try {
        return JSON.parse(str);
      } catch (error) {
        console.error("Error parsing saved image:", error);
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({ images: savedImages });

  } catch (error) {
    console.error("Get saved images error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}