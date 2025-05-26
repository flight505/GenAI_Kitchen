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
  let userId: string | undefined;
  
  console.log('Inpaint route called, API key status:', process.env.REPLICATE_API_KEY ? 'Present' : 'Missing');
  
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

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('Failed to parse request body:', jsonError);
      return new Response("Invalid JSON in request body", { status: 400 });
    }
    
    console.log('Inpaint request received:', {
      hasImageUrl: !!body.imageUrl,
      hasMaskImage: !!body.maskImage,
      maskImageLength: body.maskImage?.length,
      prompt: body.prompt
    });
    
    const { imageUrl, maskImage, prompt } = body;

    if (!imageUrl || !maskImage || !prompt) {
      console.error('Missing parameters:', { imageUrl: !!imageUrl, maskImage: !!maskImage, prompt: !!prompt });
      return new Response("Missing required parameters", { status: 400 });
    }

    console.log('Starting Replicate inpainting with:', {
      prompt: enhancePromptForAPI(prompt, 'inpainting'),
      hasImage: !!imageUrl,
      hasMask: !!maskImage
    });
    
    // POST request to Replicate to start the inpainting process using Flux Fill Pro
    let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
      body: JSON.stringify({
        // Using flux-dev-inpainting model by zsxkib
        version: "ca8350ff748d56b3ebbd5a12bd3436c2214262a4ff8619de9890ecc41751a008",
        input: {
          prompt: enhancePromptForAPI(prompt, 'inpainting'),
          image: imageUrl,
          mask: maskImage,
          num_inference_steps: 28,
          strength: 0.95,
          guidance_scale: 3.5,
          seed: Math.floor(Math.random() * 1000000),
          output_format: "jpg"
        },
      }),
    });

    if (!startResponse.ok) {
      let errorData;
      try {
        errorData = await startResponse.json();
      } catch (e) {
        errorData = { detail: 'Failed to parse error response' };
      }
      console.error("Replicate API error:", {
        status: startResponse.status,
        statusText: startResponse.statusText,
        error: errorData,
        apiKey: process.env.REPLICATE_API_KEY ? 'Set' : 'Missing'
      });
      return new Response(`Replicate API error: ${errorData.detail || startResponse.statusText || 'Unknown error'}`, {
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
      try {
        await monitor.trackUsage({
          endpoint: 'inpaint',
          userId,
          timestamp: Date.now(),
          success: false,
          error: 'Timeout after 30 seconds',
          modelVersion: 'ca8350ff748d56b3ebbd5a12bd3436c2214262a4ff8619de9890ecc41751a008'
        });
      } catch (monitorError) {
        console.error('Failed to track timeout:', monitorError);
      }
      return new Response("Timeout: Inpainting took too long", { status: 504 });
    }

    // Track successful inpainting
    try {
      await monitor.trackUsage({
        endpoint: 'inpaint',
        userId,
        timestamp: Date.now(),
        success: true,
        cost: monitor.estimateCost('flux-dev'),
        modelVersion: 'ca8350ff748d56b3ebbd5a12bd3436c2214262a4ff8619de9890ecc41751a008'
      });
    } catch (monitorError) {
      console.error('Failed to track usage:', monitorError);
    }

    return NextResponse.json(inpaintedImage);
  } catch (error) {
    console.error("Unexpected error:", error);
    
    // Track error
    try {
      await monitor.trackUsage({
        endpoint: 'inpaint',
        userId,
        timestamp: Date.now(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } catch (monitorError) {
      console.error('Failed to track error:', monitorError);
    }
    
    return new Response(`Server error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      status: 500
    });
  }
} 