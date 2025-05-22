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
  try {
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

    const { imageUrl, theme, room } = await request.json();

    if (!imageUrl) {
      return new Response("Missing required parameter: imageUrl", { status: 400 });
    }

    // POST request to Replicate to start the image restoration generation process
    let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
      body: JSON.stringify({
        // Updated to latest Flux Canny Pro model version
        // Using the stable released version rather than a development version
        version: "b490e8c7b82f557c9e4b55b00060a93aba54f8c95642dd19d308b67184b86189",
        input: {
          image: imageUrl,
          prompt: `a ${theme.toLowerCase()} kitchen`,
          steps: 30,
          guidance: 8.0,
          safety_tolerance: 5
        },
      }),
    });

    if (!startResponse.ok) {
      const errorData = await startResponse.json();
      console.error("Replicate API error:", errorData);
      return new Response(`Replicate API error: ${errorData.detail || 'Unknown error'}`, {
        status: startResponse.status
      });
    }

    let jsonStartResponse = await startResponse.json();

    let endpointUrl = jsonStartResponse.urls?.get;
    if (!endpointUrl) {
      return new Response("Invalid response from Replicate API", { status: 500 });
    }

    // GET request to get the status of the image restoration process & return the result when it's ready
    let restoredImage: string | null = null;
    let attempts = 0;
    const maxAttempts = 30; // Timeout after 30 attempts (30 seconds)
    
    while (!restoredImage && attempts < maxAttempts) {
      attempts++;
      // Loop in 1s intervals until the image is ready
      console.log(`polling for results... attempt ${attempts}`);
      
      let finalResponse = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + process.env.REPLICATE_API_KEY,
        },
      });

      if (!finalResponse.ok) {
        const errorData = await finalResponse.json();
        console.error("Replicate status API error:", errorData);
        return new Response(`Replicate status API error: ${errorData.detail || 'Unknown error'}`, {
          status: finalResponse.status
        });
      }
      
      let jsonFinalResponse = await finalResponse.json();

      if (jsonFinalResponse.status === "succeeded") {
        restoredImage = jsonFinalResponse.output;
        break;
      } else if (jsonFinalResponse.status === "failed") {
        const errorMsg = jsonFinalResponse.error || "Image generation failed";
        console.error("Generation failed:", errorMsg);
        return new Response(`Generation failed: ${errorMsg}`, { status: 500 });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!restoredImage) {
      return new Response("Timeout: Image generation took too long", { status: 504 });
    }

    return NextResponse.json(restoredImage);
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(`Server error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      status: 500
    });
  }
}
