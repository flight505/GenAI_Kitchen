// import { Ratelimit } from "@upstash/ratelimit";
// import redis from "../../utils/redis";
import { NextResponse } from "next/server";
// import { headers } from "next/headers";
import { enhancePromptForAPI } from "../../utils/unoformPromptBuilder";
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
  const startTime = Date.now();
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

    const { imageUrl, prompt, guidance, steps, strength, model = 'canny-pro' } = await request.json();

    if (!imageUrl) {
      return new Response("Missing required parameter: imageUrl", { status: 400 });
    }

    if (!prompt) {
      return new Response("Missing required parameter: prompt", { status: 400 });
    }

    // Determine which model to use
    let modelVersion: string;
    let modelInput: any;
    let modelName: string;

    if (model === 'flux-pro') {
      // FLUX 1.1 Pro - Creative mode with full redesign capability
      modelVersion = "80a09d66baa990429c2f5ae8a4306bf778a1b3775afd01cc2cc8bdbe9033769c";
      modelName = 'flux-1.1-pro';
      modelInput = {
        prompt: enhancePromptForAPI(prompt, 'generation'),
        aspect_ratio: "16:9", // Kitchen visualization aspect ratio
        width: 1344,
        height: 768,
        safety_tolerance: 2,
        output_format: "png",
        ...(guidance && { guidance_scale: guidance }), // FLUX 1.1 Pro uses guidance_scale
        ...(steps && { num_inference_steps: steps })
      };
    } else {
      // FLUX Canny Pro (default) - maintains exact kitchen layout while changing style
      modelVersion = "3e03126bd3fbb9349783930f4139eb6c488aef2197c4d3fd2a826b35ccecea3d";
      modelName = 'flux-canny-pro';
      modelInput = {
        prompt: enhancePromptForAPI(prompt, 'generation'),
        control_image: imageUrl, // Canny Pro uses control_image for structure preservation
        guidance: guidance || 30, // Canny Pro optimal guidance (default: 30)
        steps: steps || 50, // Canny Pro optimal steps (default: 50)
        safety_tolerance: 2,
        output_format: "png" // Changed to png as webp is not supported
      };
    }

    // POST request to Replicate to start the image generation process
    let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
      body: JSON.stringify({
        version: modelVersion,
        input: modelInput
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
      // Track timeout
      await monitor.trackUsage({
        endpoint: 'generate',
        userId,
        timestamp: Date.now(),
        success: false,
        error: 'Timeout after 30 seconds',
        modelVersion: modelVersion
      });
      return new Response("Timeout: Image generation took too long", { status: 504 });
    }

    // Track successful generation
    await monitor.trackUsage({
      endpoint: 'generate',
      userId,
      timestamp: Date.now(),
      success: true,
      cost: monitor.estimateCost(modelName),
      modelVersion: modelVersion
    });

    return NextResponse.json(restoredImage);
  } catch (error) {
    console.error("Unexpected error:", error);
    
    // Track error
    await monitor.trackUsage({
      endpoint: 'generate',
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
