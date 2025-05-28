import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { buildUnoformPrompt } from '@/utils/unoformPromptBuilder';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY as string,
});

export async function POST(request: NextRequest) {
  try {
    const { 
      emptyRoom,
      parameters 
    } = await request.json();

    // Validate inputs
    if (!emptyRoom) {
      return NextResponse.json({ error: 'Empty room image is required' }, { status: 400 });
    }

    // Build prompt for empty room projection
    const prompt = buildEmptyRoomPrompt(parameters);

    // Use FLUX Depth for perspective-aware generation
    const model = 'black-forest-labs/flux-depth-dev:97c293b16e4e42a3a5aae4d9b1cbdfacb99dca63d6c6a0e87810daef1ee37e72';
    
    const input = {
      control_image: emptyRoom,
      prompt: prompt,
      guidance_scale: parameters?.guidance_scale || 3.5,
      num_inference_steps: parameters?.num_inference_steps || 28,
      num_outputs: 1,
      output_format: 'webp',
      output_quality: 80
    };

    console.log('Starting empty room generation with FLUX Depth:', input);

    // Run the model
    const output = await replicate.run(model, { input });

    // Extract the result URL
    const imageUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({
      imageUrl,
      prompt: prompt,
      message: 'Kitchen design generated for empty room'
    });

  } catch (error: any) {
    console.error('Empty room projection error:', error);
    return NextResponse.json(
      { error: error.message || 'Empty room projection failed' },
      { status: 500 }
    );
  }
}

function buildEmptyRoomPrompt(params: any): string {
  const basePrompt = params.prompt || 'modern Scandinavian kitchen';
  
  // Add room-specific details
  const roomContext = [];
  
  if (params.roomDimensions) {
    const { width, height, depth } = params.roomDimensions;
    roomContext.push(`room dimensions ${width}m x ${depth}m x ${height}m height`);
  }
  
  // Add lighting condition
  const lightingDescriptions = {
    natural: 'natural daylight streaming through windows, soft shadows',
    evening: 'warm evening ambient lighting, cozy atmosphere',
    bright: 'bright studio lighting, evenly lit, professional photography'
  };
  
  const lighting = params.lightingCondition || 'natural';
  const lightingDesc = lightingDescriptions[lighting as keyof typeof lightingDescriptions];
  
  // Add Unoform-specific styling
  const unoformStyle = buildUnoformPrompt({
    style: 'copenhagen',
    material: {
      type: 'wood',
      name: 'light oak',
      descriptor: 'natural wood grain',
      appearance: ['warm', 'textured']
    },
    features: ['integrated handles', 'soft-close drawers'],
    details: ['minimalist', 'clean lines'],
    mood: {
      lighting: lighting,
      atmosphere: 'minimalist'
    },
    modelType: 'flux-pro'
  });
  
  // Combine all elements
  return `${basePrompt} in empty room, ${roomContext.join(', ')}, ${lightingDesc}, ${unoformStyle}, complete kitchen installation with proper perspective, photorealistic, architectural visualization`;
}