# Professional UI Implementation Guide

## Overview

The professional interface at `/professional` is built as an enhanced version of the `/dream` interface, specifically designed for Unoform employees who need advanced features and batch processing capabilities.

## Architecture Principles

### 1. **Reuse Existing Components**
- Use components from `/dream` as the foundation (UploadDropzone, CompareSlider, Toast)
- Don't reinvent what already works well
- Maintain consistency with the existing codebase

### 2. **Keep It Simple**
- Start with a minimal viable professional interface
- Add complexity only when needed
- Focus on functionality over fancy UI elements

### 3. **Maintain Unoform Brand**
- Gold accent color (#C19A5B)
- Clean, minimalist design
- Sharp corners, professional typography
- White backgrounds with subtle gray accents

## Current Implementation

### Core Component: ProfessionalInterfaceV2

Located at `/components/professional/ProfessionalInterfaceV2.tsx`, this component provides:

1. **Model Selection**
   - FLUX Canny Pro for structure-preserving edits
   - FLUX 1.1 Pro for creative generation
   - Clear cost display per model

2. **Parameter Controls**
   - Horizontal parameter bar (not accordions)
   - Simple sliders with real-time value display
   - Model-specific parameters that update on selection

3. **Image Management**
   - Single upload with Bytescale widget
   - Recent uploads sidebar (simple grid/list view)
   - History navigation with undo/redo

4. **Generation Workflow**
   - Clear prompt input field
   - Processing state with loading indicator
   - Compare slider for before/after view
   - Download functionality

## Implementation Details

### State Management
```typescript
interface WorkflowState {
  selectedModel: string;
  parameters: Record<string, any>;
  sourceImage: string | null;
  isProcessing: boolean;
  resultImage: string | null;
  prompt: string;
}
```

### Model Configuration
Models are defined in `/constants/models.ts` with full specifications. The UI uses a simplified configuration:

```typescript
const modelUIConfigs = {
  'flux-canny-pro': {
    name: 'FLUX Canny Pro',
    cost: MODEL_CONFIGS['flux-canny-pro'].costPerRun,
    type: 'canny-pro',
    parameters: {
      steps: { min: 15, max: 50, default: 50, label: 'Quality' },
      guidance: { min: 1, max: 100, default: 30, label: 'Guidance' }
    }
  }
};
```

### API Integration
Uses the same endpoints as `/dream`:
- `/generate` for image generation
- Handles 429 rate limit errors
- Returns image URLs for display

## Future Enhancements

### 1. **Batch Processing**
- Multiple image upload
- Queue management
- Progress tracking per image

### 2. **Advanced Features**
- Style transfer from reference images
- Empty room projection
- Multi-reference composition

### 3. **Project Management**
- Save/load project states
- Export configurations
- Cost tracking

## What NOT to Do

1. **Don't create complex navigation**
   - No dark sidebars
   - No floating action buttons
   - No deep menu hierarchies

2. **Don't over-engineer**
   - No complex state management libraries
   - No unnecessary abstractions
   - No features without clear use cases

3. **Don't break existing patterns**
   - Keep the same upload widget
   - Use existing API endpoints
   - Maintain consistent styling

## Testing the Implementation

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/professional`
3. Test the workflow:
   - Upload an image
   - Select a model
   - Adjust parameters
   - Enter a prompt
   - Generate result
   - Use undo/redo
   - Download result

## Key Files

- `/app/professional/page.tsx` - Page component with header and scenario tabs
- `/components/professional/ProfessionalInterfaceV2.tsx` - Main interface component
- `/constants/models.ts` - Model configurations
- `/hooks/useImageHistory.ts` - History management
- `/utils/downloadPhoto.ts` - Download functionality

## Design Decisions

1. **Horizontal Layout**: Parameters in a horizontal bar instead of vertical accordions to save space
2. **Simple Image Library**: Basic grid/list view without complex filters
3. **Integrated History**: Undo/redo directly in the top bar for easy access
4. **Compare View**: Automatic switch to compare slider when result is available
5. **Cost Transparency**: Show cost per image for each model

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all imports use default exports where appropriate
2. **Type Errors**: Use proper types from `/types/models.ts`
3. **API Errors**: Check that model types match what the API expects
4. **UI Issues**: Test at different screen sizes

### Development Tips

- Use the browser console to debug API calls
- Check Redux DevTools for state issues
- Test with different image sizes
- Verify cost calculations match model configs