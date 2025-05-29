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
      parameters,
      model = 'fofr-style-transfer' // Default to fofr/style-transfer
    } = body;

    // Validate required fields
    if (!sourceImage) {
      return NextResponse.json(
        { error: 'Source image is required' },
        { status: 400 }
      );
    }

    if (scenario === 'style-transfer' && !referenceImage) {
      return NextResponse.json(
        { error: 'Reference image is required for style transfer' },
        { status: 400 }
      );
    }

    let output;
    let prompt = parameters?.prompt || '';

    // Handle different models
    switch (model) {
      case 'fofr-style-transfer':
      case 'style-transfer':
      default: {
        // fofr/style-transfer model - the correct model for style transfer
        const input = {
          style_image: referenceImage, // The reference image to copy style from
          structure_image: sourceImage, // The customer's kitchen to apply style to
          prompt: prompt || 'A modern Scandinavian kitchen with minimalist design',
          negative_prompt: parameters?.negative_prompt || 'blurry, low quality, distorted, cartoon, anime',
          width: parameters?.width || 1344, // 16:9 aspect ratio
          height: parameters?.height || 768,
          model: parameters?.style_model || 'realistic', // Options: fast, high-quality, realistic, cinematic, animated
          number_of_images: 1,
          seed: parameters?.seed || null,
          structure_depth_strength: parameters?.structure_depth_strength || 0.8, // How much to preserve original structure
          denoising_strength: parameters?.denoising_strength || 0.75, // Balance between style and structure
        };

        console.log('Using fofr style-transfer model:', input);
        output = await replicate.run(
          'fofr/style-transfer:f1023890703bc0a5a3a2c21b5e498833be5f6ef6e70e9daf6b9b3a4fd8309cf0',
          { input }
        );
        break;
      }

      case 'flux-canny-pro': {
        // Alternative: FLUX Canny Pro for edge-preserving style transfer
        const input = {
          control_image: sourceImage,
          prompt: prompt || buildStyleTransferPrompt(referenceImage, parameters),
          guidance_scale: parameters?.guidance_scale || 3.5,
          num_outputs: 1,
          output_format: 'webp',
          output_quality: 90,
          num_inference_steps: parameters?.num_inference_steps || 28,
          controlnet_conditioning_scale: parameters?.controlnet_conditioning_scale || 0.8
        };

        console.log('Using FLUX Canny Pro model:', input);
        output = await replicate.run(
          'black-forest-labs/flux-canny-pro:3e03126bd3fbb9349783930f4139eb6c488aef2197c4d3fd2a826b35ccecea3d',
          { input }
        );
        break;
      }
    }

    const imageUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({
      imageUrl,
      prompt: prompt,
      message: 'Style transfer completed successfully',
      model: model
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