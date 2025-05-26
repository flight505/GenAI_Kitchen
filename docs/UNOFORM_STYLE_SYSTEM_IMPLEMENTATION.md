# Unoform Style System Implementation Guide

## Overview

This document outlines the comprehensive Unoform Style System that has been designed to ensure consistent, high-quality kitchen design generation using both Flux Canny Pro and Flux Pro 1.1 models.

## System Architecture

### Core Components

1. **Style Knowledge Base (SKB)**
   - Location: `/constants/unoform-styles.ts`
   - Contains complete style definitions for Classic, Copenhagen, Shaker, and Avantgarde
   - Includes validation rules, material compatibility, and prompt formulas

2. **Intelligent Prompt Builder (IPB)**
   - Location: `/utils/unoformPromptBuilder.ts`
   - 5-layer prompt construction system
   - Model-aware optimizations (different for Canny Pro vs Flux Pro)
   - Style-specific enhancements

3. **Visual Validation Engine (VVE)**
   - Location: `/utils/unoformValidation.ts`
   - Checklist-based validation system
   - Scoring mechanism (0-100)
   - Suggestions and improvement guidance

4. **Customer Experience Components**
   - `UnoformStyleSelector`: User-friendly style selection interface
   - `UnoformValidationPanel`: Interactive validation checklist
   - `DesignTabV2`: Enhanced design tab with integrated style system

## Integration Steps

### 1. Update Dream Page to Use New Design Tab

```typescript
// In app/dream/page.tsx
import { DesignTabV2 } from '@/components/tabs/DesignTabV2';

// Replace the existing DesignTab with DesignTabV2
{activeTab === 'design' && (
  <DesignTabV2
    originalPhoto={originalPhoto}
    restoredImage={restoredImage}
    showAdvancedControls={showAdvancedControls}
    setShowAdvancedControls={setShowAdvancedControls}
    advancedSettings={advancedSettings}
    setAdvancedSettings={setAdvancedSettings}
    generatePhoto={generatePhoto}
    loading={loading}
    error={error}
    updateCurrentModel={updateCurrentModel}
  />
)}
```

### 2. Update Generate API Route

The generate route should accept custom prompts from the new system:

```typescript
// In app/generate/route.ts
export async function POST(request: Request) {
  const { imageUrl, model, customPrompt, ...otherParams } = await request.json();
  
  // Use customPrompt if provided, otherwise use existing logic
  const prompt = customPrompt || generatePromptFromSelections(otherParams);
  
  // Continue with existing logic...
}
```

### 3. Bridge Existing Kitchen Types

Use the bridging utility to convert existing selections:

```typescript
import { generateEnhancedPrompt } from '@/utils/promptTemplatingV2';

// In your existing code where prompts are generated
const enhancedPrompt = generateEnhancedPrompt(
  kitchenSelections,
  modelType,
  selectedUnoformStyle // optional
);
```

## How the System Works

### Prompt Building Process

1. **User selects a style** (Classic, Copenhagen, Shaker, or Avantgarde)
2. **System builds context** with material, features, details, and mood
3. **5-layer prompt construction**:
   - Layer 1: Core Identity (e.g., "Classic Unoform kitchen")
   - Layer 2: Material/Finish (e.g., "in rich walnut")
   - Layer 3: Primary Features (e.g., "with horizontal slats, thick frames")
   - Layer 4: Supporting Details (e.g., "handleless design")
   - Layer 5: Context/Mood (e.g., "soft Scandinavian daylight")

4. **Model-specific optimizations**:
   - **Canny Pro**: Adds structure preservation keywords
   - **Flux Pro 1.1**: Adds creative enhancers and aspect ratio hints

### Validation Process

1. **After generation**, user can validate the image
2. **Interactive checklist** with three categories:
   - Must Have (critical features)
   - Should Have (recommended features)
   - Must NOT Have (style violations)
3. **Automatic scoring** based on checklist
4. **Intelligent suggestions** for improvement

## Key Features

### Model-Aware Optimization

The system automatically adjusts prompts based on the selected model:

**For Flux Canny Pro:**
- Emphasizes material changes over structural changes
- Adds "maintaining kitchen layout" type phrases
- Focuses on style transfer keywords

**For Flux Pro 1.1:**
- Includes aspect ratio optimization
- Adds quality enhancers ("architectural digest quality")
- Allows more creative freedom in descriptions

### Material Compatibility

Each style has specific compatible materials:
- **Classic**: Works with all woods and most paint colors
- **Copenhagen**: Natural woods only, no paint
- **Shaker**: Painted finishes preferred
- **Avantgarde**: No wood, only modern finishes

### Validation Scoring

- **90-100**: Excellent match to style
- **70-89**: Good match with minor issues
- **50-69**: Recognizable but needs improvement
- **Below 50**: Major style violations

## Usage Examples

### Basic Usage

```typescript
// Create a prompt for Classic style with walnut
const context: PromptBuildingContext = {
  style: 'classic',
  material: {
    type: 'wood',
    name: 'walnut',
    descriptor: 'rich dark',
    appearance: ['chocolate tones', 'swirling grain']
  },
  features: ['horizontal slats', 'thick frames', 'floating base'],
  details: ['three-drawer modules', 'handleless'],
  mood: {
    lighting: 'natural',
    atmosphere: 'minimalist'
  },
  modelType: 'canny-pro',
  customerPhoto: true
};

const prompt = buildUnoformPrompt(context);
```

### Validation Usage

```typescript
// Create validator for a style
const validator = new UnoformValidator('classic');

// Get checklist for UI
const checklist = validator.getChecklist();

// Validate after user checks items
const result = validator.validateManual(checkedItems);

// Check result
if (result.isValid && result.score >= 80) {
  // Good design!
} else {
  // Show suggestions
  console.log(result.suggestions);
}
```

## Benefits

1. **Consistency**: Every generated kitchen matches Unoform's brand standards
2. **Quality**: Higher success rate with validated prompt structures
3. **Flexibility**: Works with both structure-preserving and creative models
4. **User-Friendly**: Customers don't need to understand prompting
5. **Measurable**: Validation scores provide objective quality metrics

## Future Enhancements

1. **AI-Powered Validation**: Integrate vision APIs to automatically validate images
2. **Learning System**: Track which prompts produce highest validation scores
3. **Custom Styles**: Allow users to save their own style combinations
4. **Multi-Language**: Translate the system for international markets

## Testing the System

1. **Test each style** with different materials
2. **Compare Canny Pro vs Flux Pro** outputs
3. **Validate scoring** matches visual quality
4. **Gather user feedback** on the interface
5. **A/B test** prompt variations

## Troubleshooting

**Issue**: Low validation scores
- Check if selected style matches user's actual preferences
- Ensure material compatibility
- Review model-specific optimizations

**Issue**: Prompts too long
- The system automatically manages length
- Focus on essential features if manual editing

**Issue**: Inconsistent results
- Use validation to identify missing elements
- Adjust mood/atmosphere settings
- Try different model for better results