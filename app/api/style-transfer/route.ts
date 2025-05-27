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
    const body = await request.json();
    const { 
      sourceImage,
      referenceImage,
      scenario,
      parameters
    } = body;

    // Validate required fields
    if (!sourceImage || !referenceImage) {
      return NextResponse.json(
        { error: 'Both source and reference images are required' },
        { status: 400 }
      );
    }

    // Build prompt that describes the style transfer
    const prompt = buildStyleTransferPrompt(referenceImage, parameters);

    // Redux only accepts single image - use customer's kitchen as base
    const input = {
      image: sourceImage,  // Customer's kitchen
      prompt: prompt,
      guidance_scale: parameters?.guidance || 3.5,
      num_outputs: 1,
      output_format: 'webp',
      output_quality: 80,
      num_inference_steps: parameters?.num_inference_steps || 28
    };

    console.log('Starting style transfer with Redux:', input);

    // Note: Redux doesn't accept reference_image parameter
    // Style must be described in the prompt
    const output = await replicate.run(
      'black-forest-labs/flux-redux-dev:96b56814e57dfa601f3f524f82a2b336ef49012cda68828cb37cde66f481b7cb',
      { input }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({
      imageUrl,
      prompt: prompt,
      message: 'Style transfer completed successfully'
    });

  } catch (error) {
    console.error('Style transfer error:', error);
    return NextResponse.json(
      { error: 'Style transfer processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function buildStyleTransferPrompt(referenceImage: string, params: any): string {
  // Since Redux doesn't accept the reference image directly,
  // we need to describe the style we want to transfer
  const basePrompt = params.prompt || '';
  
  // Add style transfer instructions
  const styleInstructions = [
    'Transform kitchen maintaining original layout and structure',
    'Apply Unoform Milano Dark Oak cabinet style',
    'Use premium materials and finishes',
    'Maintain Scandinavian minimalist aesthetic',
    'Professional lighting and composition'
  ];
  
  return `${basePrompt} ${styleInstructions.join(', ')}`;
}