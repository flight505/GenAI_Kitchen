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
      model = 'flux-redux-dev' // Default to Redux if not specified
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
      case 'interior-design':
      case 'interior-specialized': {
        // Adirik's interior design model
        const input = {
          image: sourceImage,
          prompt: prompt || buildStyleTransferPrompt(referenceImage, parameters),
          negative_prompt: parameters?.negative_prompt || '',
          guidance_scale: parameters?.guidance_scale || 7.5,
          prompt_strength: parameters?.prompt_strength || 0.8,
          num_inference_steps: parameters?.num_inference_steps || 30,
          seed: parameters?.seed || -1
        };

        console.log('Using Interior Design model:', input);
        output = await replicate.run('adirik/interior-design:76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6cac81', { input });
        break;
      }

      case 'instant-id':
      case 'ip-adapter': {
        // InstantID with IP-Adapter
        const input = {
          image: sourceImage,
          prompt: prompt || buildStyleTransferPrompt(referenceImage, parameters),
          negative_prompt: parameters?.negative_prompt || '',
          ip_adapter_scale: parameters?.ip_adapter_scale || 0.8,
          controlnet_conditioning_scale: parameters?.controlnet_conditioning_scale || 0.8,
          guidance_scale: parameters?.guidance_scale || 5,
          num_inference_steps: parameters?.num_inference_steps || 30
        };

        console.log('Using InstantID model:', input);
        output = await replicate.run('zsxkib/instant-id:592677175e5d148bec0e320dd06418b64fd1f9050ad9dc01320284a6df2154f4', { input });
        break;
      }

      case 'flux-redux-dev':
      case 'style-transfer':
      default: {
        // Default Redux model
        const transferPrompt = buildStyleTransferPrompt(referenceImage, parameters);
        const input = {
          image: sourceImage,
          prompt: transferPrompt,
          guidance_scale: parameters?.guidance || 3.5,
          num_outputs: 1,
          output_format: 'webp',
          output_quality: 80,
          num_inference_steps: parameters?.num_inference_steps || 28
        };

        console.log('Using Redux model:', input);
        output = await replicate.run(
          'black-forest-labs/flux-redux-dev:96b56814e57dfa601f3f524f82a2b336ef49012cda68828cb37cde66f481b7cb',
          { input }
        );
        prompt = transferPrompt;
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