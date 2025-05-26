// import { Ratelimit } from "@upstash/ratelimit";
// import redis from "../../utils/redis";
import { NextResponse } from "next/server";
// import { headers } from "next/headers";
import { createStyleConsistentVariationForAPI } from "../../utils/unoformPromptBuilder";
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

    const { imageUrl, prompt, guidance, steps } = await request.json();

    if (!imageUrl) {
      return new Response("Missing required parameter: imageUrl", { status: 400 });
    }

    // POST request to Replicate to start the variation generation process using Flux Redux
    let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
      body: JSON.stringify({
        // Latest Flux Redux Dev model version
        version: "96b56814e57dfa601f3f524f82a2b336ef49012cda68828cb37cde66f481b7cb",
        input: {
          redux_image: imageUrl,
          prompt: prompt ? createStyleConsistentVariationForAPI(prompt) : "Danish Scandinavian kitchen design",
          guidance: guidance || 3,
          num_inference_steps: steps || 28,
          output_format: "webp",
          num_outputs: 1,
          megapixels: "1",
          aspect_ratio: "16:9"
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

    // GET request to get the status of the variation process & return the result when it's ready
    let variationImage: string | null = null;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!variationImage && attempts < maxAttempts) {
      attempts++;
      // Loop in 1s intervals until the image is ready
      console.log(`polling for variation result... attempt ${attempts}`);
      
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
        // Flux Redux Dev returns an array of images
        variationImage = Array.isArray(jsonFinalResponse.output) 
          ? jsonFinalResponse.output[0] 
          : jsonFinalResponse.output;
        break;
      } else if (jsonFinalResponse.status === "failed") {
        const errorMsg = jsonFinalResponse.error || "Variation generation failed";
        console.error("Variation generation failed:", errorMsg);
        return new Response(`Variation generation failed: ${errorMsg}`, { status: 500 });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!variationImage) {
      // Track timeout
      await monitor.trackUsage({
        endpoint: 'variation',
        userId,
        timestamp: Date.now(),
        success: false,
        error: 'Timeout after 30 seconds',
        modelVersion: '3b71c725e2fa07c1ba4e50c61022a06d3a3cf67b87c2c27dd3f8b30d50e8f0ba'
      });
      return new Response("Timeout: Variation generation took too long", { status: 504 });
    }

    // Track successful variation
    await monitor.trackUsage({
      endpoint: 'variation',
      userId,
      timestamp: Date.now(),
      success: true,
      cost: monitor.estimateCost('flux-redux-dev'),
      modelVersion: '3b71c725e2fa07c1ba4e50c61022a06d3a3cf67b87c2c27dd3f8b30d50e8f0ba'
    });

    return NextResponse.json(variationImage);
  } catch (error) {
    console.error("Unexpected error:", error);
    
    // Track error
    await monitor.trackUsage({
      endpoint: 'variation',
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