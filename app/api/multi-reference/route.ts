import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { ReferenceImage } from '@/components/professional/ReferenceImageManager';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY as string,
});

export async function POST(request: NextRequest) {
  try {
    const { 
      targetImage,
      referenceImages,
      parameters 
    } = await request.json();

    // Validate inputs
    if (!targetImage) {
      return NextResponse.json({ error: 'Target image is required' }, { status: 400 });
    }

    if (!referenceImages || referenceImages.length < 2) {
      return NextResponse.json({ error: 'At least 2 reference images are required' }, { status: 400 });
    }

    // Sequential processing with Redux (no native multi-image support)
    let currentImage = targetImage;
    let processedCount = 0;
    const processingSteps = [];
    
    for (const ref of referenceImages) {
      const prompt = buildElementPrompt(ref.elements || [], ref);
      
      const input = {
        image: currentImage,
        prompt: prompt,
        guidance_scale: parameters?.guidance || 3.5,
        num_outputs: 1,
        output_format: 'webp',
        output_quality: 80,
        num_inference_steps: parameters?.num_inference_steps || 28
      };
      
      try {
        console.log(`Processing reference ${processedCount + 1}/${referenceImages.length}:`, prompt);
        
        const output = await replicate.run(
          'black-forest-labs/flux-redux-dev:96b56814e57dfa601f3f524f82a2b336ef49012cda68828cb37cde66f481b7cb',
          { input }
        );
        
        currentImage = Array.isArray(output) ? output[0] : output;
        processedCount++;
        
        processingSteps.push({
          step: processedCount,
          reference: ref.name,
          elements: ref.elements,
          output: currentImage
        });
        
      } catch (error) {
        console.error(`Failed at reference ${processedCount + 1}:`, error);
        break;
      }
    }
    
    return NextResponse.json({
      finalImage: currentImage,
      processedReferences: processedCount,
      totalReferences: referenceImages.length,
      steps: processingSteps,
      warning: processedCount < referenceImages.length 
        ? `Only ${processedCount} of ${referenceImages.length} references were processed`
        : 'Quality may degrade with multiple iterations'
    });

  } catch (error: any) {
    console.error('Multi-reference generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Multi-reference generation failed' },
      { status: 500 }
    );
  }
}

function buildElementPrompt(elements: string[], reference: ReferenceImage): string {
  if (!elements || elements.length === 0) {
    return `Apply style and design elements from reference image, weight ${reference.weight || 1}`;
  }
  
  const elementDescriptions: Record<string, string> = {
    cabinets: 'cabinet style, door design, and hardware',
    island: 'kitchen island design and configuration',
    countertops: 'countertop material and edge style',
    backsplash: 'backsplash pattern and material',
    colors: 'color scheme and finishes',
    hardware: 'handles, knobs, and fixtures',
    lighting: 'lighting fixtures and arrangement'
  };
  
  const selectedElements = elements
    .map(el => elementDescriptions[el] || el)
    .join(', ');
  
  return `Apply ${selectedElements} from reference image, maintaining original kitchen layout, weight ${reference.weight || 1}`;
}