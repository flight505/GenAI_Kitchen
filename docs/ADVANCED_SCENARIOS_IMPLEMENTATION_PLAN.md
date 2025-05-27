# Advanced Scenarios Implementation Plan

## Overview
This document outlines the implementation plan for three advanced customer scenarios using FLUX.1 Tools from Black Forest Labs, based on the latest information from Replicate and official sources.

## Available FLUX Models (2025)

### Core Models on Replicate
1. **FLUX.1 [dev]** - Base text-to-image model
   - Model: `black-forest-labs/flux-dev`
   - 12B parameter rectified flow transformer
   
2. **FLUX 1.1 [pro]** - Enhanced flagship model
   - Model: `black-forest-labs/flux-1.1-pro`
   - Supports Ultra mode (4MP) and Raw mode (photorealistic)

3. **FLUX Redux [dev]** - Image variation and style mixing
   - Model: `black-forest-labs/flux-redux-dev`
   - Adapter for creating variations while preserving key elements

### FLUX.1 Tools Suite (Released November 2024)
- **FLUX.1 Fill** - Inpainting/outpainting with text editing capability
- **FLUX.1 Depth** - Depth-aware generation preserving 3D relationships
- **FLUX.1 Canny** - Edge-based structural control
- **FLUX.1 Redux** - Image mixing and variation

## Implementation Plan for Advanced Scenarios

### Scenario 1: Reference Style Transfer
**Customer Need**: Apply showroom kitchen style to their actual kitchen space

#### Solution: FLUX Redux [dev]
```typescript
// Model endpoint (if available on Replicate)
const FLUX_REDUX_MODEL = "black-forest-labs/flux-redux-dev";

// Implementation in variation route
export async function styleTransfer(request: Request) {
  const { showroomImage, customerKitchen, prompt } = await request.json();
  
  const input = {
    // Redux accepts an image input for variation
    image: showroomImage,
    prompt: `Apply this ${prompt} Unoform kitchen style to customer space, 
             maintaining room layout and windows`,
    num_outputs: 1,
    guidance_scale: 3.5,
    megapixels: "1" // or "1.5" for higher quality
  };
  
  // Use Redux to generate style variation
  const prediction = await replicate.run(FLUX_REDUX_MODEL, { input });
  return prediction;
}
```

#### UI Changes Needed:
1. Add "Style Reference" upload option in UploadTab
2. Create new "Style Transfer" mode in WorkflowTabs
3. Add reference image preview alongside main image

### Scenario 2: Empty Room Projection
**Customer Need**: Visualize Unoform kitchen in empty room

#### Solution: FLUX.1 Depth + FLUX 1.1 Pro
```typescript
// Two-step process: Extract depth, then generate

// Step 1: Use depth extraction (if Depth model available)
const FLUX_DEPTH_MODEL = "black-forest-labs/flux-depth-dev"; // Check availability

// Alternative: Use standard FLUX with depth-aware prompting
const FLUX_PRO_MODEL = "black-forest-labs/flux-1.1-pro";

export async function emptyRoomKitchen(request: Request) {
  const { emptyRoomImage, kitchenStyle, prompt } = await request.json();
  
  // If Depth model is available:
  const depthInput = {
    image: emptyRoomImage,
    prompt: `${kitchenStyle} Unoform kitchen installation, 
             full kitchen with cabinets, island, appliances,
             maintaining room perspective and natural lighting`,
    preserve_depth: true
  };
  
  // Fallback: Use FLUX Pro with perspective-aware prompting
  const proInput = {
    prompt: `Empty room transformed into ${kitchenStyle} Unoform kitchen,
             maintain exact room dimensions and window positions,
             add full kitchen installation with proper perspective,
             ${prompt}`,
    aspect_ratio: "16:9",
    width: 1344,
    height: 768,
    steps: 50,
    guidance: 7.5
  };
  
  const prediction = await replicate.run(FLUX_PRO_MODEL, { input: proInput });
  return prediction;
}
```

#### UI Changes Needed:
1. Add "Empty Room" mode detection in UploadTab
2. Create guided wizard for empty room specifications
3. Add room dimension input fields
4. Include perspective guidelines overlay

### Scenario 3: Multi-Reference Composition
**Customer Need**: Combine elements from multiple kitchen references

#### Solution: FLUX Redux with Sequential Processing
```typescript
// Redux can handle variations, use iteratively for multi-reference

export async function multiReferenceComposition(request: Request) {
  const { references, targetKitchen, weights } = await request.json();
  
  // Process references sequentially with Redux
  let currentImage = targetKitchen;
  
  for (const ref of references) {
    const input = {
      image: currentImage,
      prompt: `Incorporate ${ref.element} style from reference, 
               ${ref.description}, weight: ${ref.weight}`,
      guidance_scale: 3.5 * ref.weight, // Adjust influence
      num_outputs: 1
    };
    
    currentImage = await replicate.run(FLUX_REDUX_MODEL, { input });
  }
  
  return currentImage;
}

// Alternative: Use FLUX Pro with detailed composite prompting
const compositePrompt = references.map(ref => 
  `${ref.element} in style of ${ref.description}`
).join(', ');
```

#### UI Changes Needed:
1. Multi-image upload interface (up to 3 references)
2. Element selector for each reference (cabinets/island/colors)
3. Weight/influence sliders
4. Preview grid showing all references

## Implementation Priority

### Phase 1: Redux Integration (Style Transfer)
1. Check Redux model availability on Replicate
2. Add reference image upload capability
3. Implement style transfer workflow
4. Test with Unoform catalog images

### Phase 2: Empty Room Support
1. Research depth extraction options
2. Implement perspective-aware prompting
3. Create empty room detection
4. Add room specification interface

### Phase 3: Multi-Reference System
1. Design multi-upload interface
2. Implement sequential processing
3. Add element selection UI
4. Create composition preview

## Technical Considerations

### Model Availability
- Verify each model's availability on Replicate
- Prepare fallback strategies using available models
- Consider using Black Forest Labs API directly if needed

### API Rate Limits
- Implement queuing for multi-step processes
- Add progress indicators for long operations
- Cache intermediate results

### Image Processing
- Maintain 16:9 aspect ratio (1344x768)
- Implement image preprocessing for consistency
- Handle multiple image formats

### Cost Management
- Redux/Depth models may have different pricing
- Implement usage tracking for new workflows
- Add cost estimates in UI

## Alternative Approaches

If specific FLUX Tools aren't available on Replicate:

1. **Use FLUX 1.1 Pro with Advanced Prompting**
   - Leverage Ultra mode for high-quality outputs
   - Use detailed prompts for style transfer
   - Implement custom depth-aware prompts

2. **Combine Existing Models**
   - Use Canny Pro for structure
   - Apply variations with Redux Dev
   - Refine with inpainting

3. **Direct API Integration**
   - Access Black Forest Labs API at api.bfl.ml
   - Implement server-side proxy for authentication
   - Map to existing UI components

## Next Steps

1. Verify model availability on Replicate
2. Create proof-of-concept for each scenario
3. Design UI mockups for new workflows
4. Implement Phase 1 (Redux style transfer)
5. Gather user feedback before proceeding

This implementation plan provides a roadmap for expanding GenAI Kitchen's capabilities to handle complex, real-world customer scenarios using the latest FLUX models.