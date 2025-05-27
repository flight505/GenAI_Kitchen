import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/utils/server-auth';
import Replicate from 'replicate';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY as string,
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = await verifyToken(token);

    const { 
      roomImage, 
      kitchenStyle, 
      dimensions, 
      perspective,
      parameters 
    } = await request.json();

    // Validate inputs
    if (!roomImage) {
      return NextResponse.json({ error: 'Room image is required' }, { status: 400 });
    }

    // Build prompt for empty room projection
    const prompt = buildEmptyRoomPrompt(kitchenStyle, dimensions);

    // Use FLUX Pro with depth-aware prompting
    // In the future, can switch to FLUX Depth when available
    const model = 'black-forest-labs/flux-1.1-pro:80a09d66baa990429c2f5ae8a4306bf778a1b3775afd01cc2cc8bdbe9033769c';
    
    const input = {
      prompt,
      aspect_ratio: parameters?.aspect_ratio || '16:9',
      width: parameters?.width || 1344,
      height: parameters?.height || 768,
      steps: parameters?.steps || 50,
      guidance: parameters?.guidance || 7.5,
      seed: parameters?.seed,
      safety_tolerance: parameters?.safety_tolerance || 2,
      output_format: parameters?.output_format || 'png',
      output_quality: parameters?.output_quality || 90,
    };

    // Run the model
    const output = await replicate.run(model, { input });

    // Extract the result URL
    const resultUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({
      success: true,
      output: resultUrl,
      metadata: {
        model,
        prompt,
        parameters: input,
        cost: 0.055, // FLUX Pro cost per run
        processingTime: 20, // Estimated time
      }
    });

  } catch (error: any) {
    console.error('Empty room projection error:', error);
    return NextResponse.json(
      { error: error.message || 'Empty room projection failed' },
      { status: 500 }
    );
  }
}

function buildEmptyRoomPrompt(kitchenStyle: string, dimensions?: any): string {
  const basePrompt = `Empty room transformed into ${kitchenStyle || 'modern'} Unoform kitchen installation`;
  
  const details = [
    'maintain exact room dimensions and window positions',
    'add full kitchen with cabinets, island, and integrated appliances',
    'preserve natural lighting and shadows',
    'ensure proper perspective and scale',
    'professional Scandinavian design',
    'high-end materials and finishes'
  ];

  if (dimensions?.width && dimensions?.length) {
    details.push(`room dimensions: ${dimensions.width}m x ${dimensions.length}m`);
  }

  if (dimensions?.ceilingHeight) {
    details.push(`ceiling height: ${dimensions.ceilingHeight}m`);
  }

  return `${basePrompt}, ${details.join(', ')}`;
}