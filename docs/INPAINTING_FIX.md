# Inpainting Model Fix Documentation

## Issue
The inpainting functionality was failing with a 422 error from Replicate API:
```
"The specified version does not exist (or perhaps you don't have permission to use it?)"
```

## Root Cause
The application was using an outdated or incorrect model version ID for the Flux inpainting model.

## Solution Implemented

### 1. Updated Model Version
Changed from the non-existent model version to the correct `flux-dev-inpainting` model by zsxkib:
- **Old version**: `4fde0da7a29a4c5fa35f1ab3612ea23bf470e275f797e5018b4753e9e0090e29`
- **New version**: `ca8350ff748d56b3ebbd5a12bd3436c2214262a4ff8619de9890ecc41751a008`

### 2. Updated Model Parameters
The flux-dev-inpainting model uses different parameter names:
- `steps` → `num_inference_steps` (default: 28)
- `guidance` → `guidance_scale` (default: 3.5)
- Added `strength` parameter (default: 0.95)

### 3. Files Modified

#### `/app/inpaint/route.ts`
- Updated model version ID
- Changed parameter names to match the new model's API
- Updated monitoring to use 'flux-dev' for cost estimation

#### `/constants/models.ts`
- Changed 'flux-fill-pro' to 'flux-dev-inpainting'
- Updated model configuration with correct parameters
- Set appropriate defaults for the new model

#### `/types/models.ts`
- Added 'flux-dev-inpainting' to ModelId type
- Created FluxDevInpaintingInput interface

#### `/utils/monitoring.ts`
- Added 'flux-dev' to MODEL_COSTS for accurate cost tracking

## Model Information
The flux-dev-inpainting model:
- Created by: zsxkib
- Runs on: Nvidia A100 (80GB) GPU
- Average completion time: ~20 seconds
- Recommended settings:
  - num_inference_steps: 20-30
  - strength: 0.85-1.0
  - guidance_scale: 3-5

## Testing
After implementing these changes:
1. The build completes successfully
2. TypeScript compilation passes without errors
3. The inpainting endpoint now uses the correct model version

## Notes
- The flux-dev model wasn't specifically trained for inpainting but provides good results
- Consider experimenting with the strength parameter for different prompts
- The model expects the mask to be the same size as the input image