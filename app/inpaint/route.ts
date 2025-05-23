// import { Ratelimit } from "@upstash/ratelimit";
// import redis from "../../utils/redis";
import { NextResponse } from "next/server";
// import { headers } from "next/headers";
import { enhancePromptWithUnoformStyle } from "../../utils/promptTemplating";
import { APIMonitor } from "../../utils/monitoring";
import { verifyToken } from "../../utils/server-auth";

// Create a new ratelimiter, that allows 5 requests per 24 hours
// const ratelimit = redis
//   ? new Ratelimit({
//       redis: redis,
//       limiter: Ratelimit.fixedWindow(5, "1440 m"),
//       analytics: true,
//     })
//   : undefined;

export async function POST(request: Request) {
  const monitor = APIMonitor.getInstance();
  let userId: string | undefined;
  
  try {
    // Try to get user ID from auth token if present
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const payload = await verifyToken(token);
        userId = payload.username;
      } catch {
        // Continue without user ID if token is invalid
      }
    }
    // Rate Limiter Code - TEMPORARILY DISABLED FOR TESTING
    // if (ratelimit) {
    //   const headersList = headers();
    //   const ipIdentifier = headersList.get("x-real-ip");

    //   const result = await ratelimit.limit(ipIdentifier ?? "");

    //   if (!result.success) {
    //     return new Response(
    //       "Too many uploads in 1 day. Please try again in a 24 hours.",
    //       {
    //         status: 429,
    //         headers: {
    //           "X-RateLimit-Limit": result.limit,
    //           "X-RateLimit-Remaining": result.remaining,
    //         } as any,
    //       }
    //     );
    //   }
    // }

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
        // Using Flux Fill Pro for inpainting
        version: "10b45d01bb46cffc8d7893b36d720e369d732bb2e48ca3db469a18929eff359d",
        input: {
          prompt: enhancePromptWithUnoformStyle(prompt, 'inpainting'),
          image: imageUrl,
          mask: maskImage,
          steps: 50,
          guidance: 60,
          prompt_upsampling: true,
          safety_tolerance: 2,
          output_format: "png"
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

    // GET request to get the status of the inpainting process & return the result when it's ready
    let inpaintedImage: string | null = null;
    let attempts = 0;
    const maxAttempts = 50; // Inpainting might take longer, allow more attempts
    
    while (!inpaintedImage && attempts < maxAttempts) {
      attempts++;
      // Loop in 1s intervals until the image is ready
      console.log(`polling for inpainting result... attempt ${attempts}`);
      
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
        inpaintedImage = jsonFinalResponse.output;
        break;
      } else if (jsonFinalResponse.status === "failed") {
        const errorMsg = jsonFinalResponse.error || "Inpainting failed";
        console.error("Inpainting failed:", errorMsg);
        return new Response(`Inpainting failed: ${errorMsg}`, { status: 500 });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!inpaintedImage) {
      // Track timeout
      await monitor.trackUsage({
        endpoint: 'inpaint',
        userId,
        timestamp: Date.now(),
        success: false,
        error: 'Timeout after 30 seconds',
        modelVersion: '10b45d01bb46cffc8d7893b36d720e369d732bb2e48ca3db469a18929eff359d'
      });
      return new Response("Timeout: Inpainting took too long", { status: 504 });
    }

    // Track successful inpainting
    await monitor.trackUsage({
      endpoint: 'inpaint',
      userId,
      timestamp: Date.now(),
      success: true,
      cost: monitor.estimateCost('flux-fill-pro'),
      modelVersion: '10b45d01bb46cffc8d7893b36d720e369d732bb2e48ca3db469a18929eff359d'
    });

    return NextResponse.json(inpaintedImage);
  } catch (error) {
    console.error("Unexpected error:", error);
    
    // Track error
    await monitor.trackUsage({
      endpoint: 'inpaint',
      userId,
      timestamp: Date.now(),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return new Response(`Server error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      status: 500
    });
  }
} 