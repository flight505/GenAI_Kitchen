import { Ratelimit } from "@upstash/ratelimit";
import redis from "../../utils/redis";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

// Create a new ratelimiter, that allows 5 requests per 24 hours
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.fixedWindow(5, "1440 m"),
      analytics: true,
    })
  : undefined;

export async function POST(request: Request) {
  // Rate Limiter Code
  if (ratelimit) {
    const headersList = headers();
    const ipIdentifier = headersList.get("x-real-ip");

    const result = await ratelimit.limit(ipIdentifier ?? "");

    if (!result.success) {
      return new Response(
        "Too many uploads in 1 day. Please try again in a 24 hours.",
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": result.limit,
            "X-RateLimit-Remaining": result.remaining,
          } as any,
        }
      );
    }
  }

  const { imageUrl, maskImage, prompt } = await request.json();

  if (!imageUrl || !maskImage || !prompt) {
    return new Response("Missing required parameters", { status: 400 });
  }

  // POST request to Replicate to start the inpainting process using Flux Fill Pro
  let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Token " + process.env.REPLICATE_API_KEY,
    },
    body: JSON.stringify({
      // Using Flux Fill Pro model for inpainting
      version: "b86af25c58d0dd7fa8f7f433f83ac65f8a9c6f3be18e178b14c6d3553af06cdb",
      input: {
        image: imageUrl,
        mask: maskImage,
        prompt: prompt,
        steps: 50,
        guidance: 3.0,
        safety_tolerance: 5, // Permissive level for kitchen content
      },
    }),
  });

  let jsonStartResponse = await startResponse.json();

  let endpointUrl = jsonStartResponse.urls.get;

  // GET request to get the status of the inpainting process & return the result when it's ready
  let inpaintedImage: string | null = null;
  while (!inpaintedImage) {
    // Loop in 1s intervals until the image is ready
    console.log("polling for inpainting result...");
    let finalResponse = await fetch(endpointUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
    });
    let jsonFinalResponse = await finalResponse.json();

    if (jsonFinalResponse.status === "succeeded") {
      inpaintedImage = jsonFinalResponse.output;
    } else if (jsonFinalResponse.status === "failed") {
      break;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return NextResponse.json(
    inpaintedImage ? inpaintedImage : "Failed to generate inpainted image"
  );
} 