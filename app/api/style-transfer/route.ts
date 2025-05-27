import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY || '',
});

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "unoform-kitchen-design-secret-key-2024"
);

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
    if (authCookie) {
      tokenFromCookie = authCookie.split("=")[1];
    }
  }
  
  const token = tokenFromHeader || tokenFromCookie;
  
  if (!token) {
    return null;
  }
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.username as string;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const username = await getUserFromToken(request);
    if (!username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      referenceImage, 
      targetImage,
      prompt,
      transferMode = 'style',
      transferIntensity = 0.7,
      aspectRatio = '16:9',
      seed
    } = body;

    // Validate required fields
    if (!referenceImage) {
      return NextResponse.json(
        { error: 'Reference image is required' },
        { status: 400 }
      );
    }

    // Build the prompt based on transfer mode and target context
    let enhancedPrompt = '';
    const baseContext = targetImage 
      ? 'Transform this kitchen to match the reference style. '
      : 'Create a kitchen design based on the reference style. ';
    
    switch (transferMode) {
      case 'style':
        enhancedPrompt = baseContext + `Apply the visual style, color palette, and aesthetic from the reference. ${prompt || 'Maintain Scandinavian minimalist aesthetic with Unoform quality.'}`;
        break;
      case 'element':
        enhancedPrompt = baseContext + `Transfer specific design elements like cabinet styles, hardware, and fixtures. ${prompt || 'Focus on Unoform signature elements and hardware.'}`;
        break;
      case 'material':
        enhancedPrompt = baseContext + `Apply the materials, textures, and finishes from the reference. ${prompt || 'Use premium Unoform materials and finishes.'}`;
        break;
      default:
        enhancedPrompt = baseContext + (prompt || 'Create a modern Unoform kitchen design.');
    }

    // Calculate guidance based on transfer intensity
    const guidance = 3 + (transferIntensity * 4); // Range 3-7

    // FLUX Redux creates variations based on the reference image
    // It doesn't directly transfer to a target, so we use the reference as the base
    const prediction = await replicate.predictions.create({
      version: "96b56814e57dfa601f3f524f82a2b336ef49012cda68828cb37cde66f481b7cb",
      input: {
        redux_image: referenceImage,
        prompt: enhancedPrompt,
        guidance,
        aspect_ratio: aspectRatio,
        num_outputs: 1,
        num_inference_steps: 28,
        output_format: "jpg",
        output_quality: 90,
        megapixels: "1",
        seed: seed || Math.floor(Math.random() * 1000000)
      }
    });

    // Poll for completion
    let currentPrediction = prediction;
    const maxAttempts = 300; // 5 minutes max
    let attempts = 0;

    while (currentPrediction.status !== 'succeeded' && currentPrediction.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      currentPrediction = await replicate.predictions.get(prediction.id);
      attempts++;
    }

    if (currentPrediction.status === 'failed') {
      console.error('Style transfer failed:', currentPrediction.error);
      return NextResponse.json(
        { error: 'Style transfer failed', details: currentPrediction.error },
        { status: 500 }
      );
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Style transfer timeout - please try again' },
        { status: 504 }
      );
    }

    // Return the generated image
    const outputUrl = Array.isArray(currentPrediction.output) 
      ? currentPrediction.output[0] 
      : currentPrediction.output;

    return NextResponse.json({
      success: true,
      outputUrl,
      metadata: {
        referenceImage,
        targetImage,
        transferMode,
        transferIntensity,
        guidance,
        seed: (currentPrediction.input as any)?.seed,
        model: 'flux-redux-dev',
        processingTime: currentPrediction.metrics?.predict_time
      }
    });

  } catch (error) {
    console.error('Style transfer error:', error);
    return NextResponse.json(
      { error: 'Style transfer processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}