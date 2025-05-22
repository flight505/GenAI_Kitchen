/**
 * Prompt Templating Utilities for Unoform Style Integration
 * 
 * This module handles the injection of Unoform's signature style into AI prompts
 * to ensure consistent brand aesthetics across all generated kitchen designs.
 */

// Unoform style token - can be updated when fine-tuned model is ready
const UNOFORM_STYLE_TOKEN = 'in Unoform signature Danish style';

// Alternative style descriptors for different contexts
const UNOFORM_STYLE_DESCRIPTORS = {
  modern: 'with clean Scandinavian lines and minimalist Danish design',
  traditional: 'with elegant Danish craftsmanship and timeless Nordic appeal',
  luxury: 'with premium Danish materials and sophisticated Scandinavian aesthetics',
  default: UNOFORM_STYLE_TOKEN
};

/**
 * Checks if a prompt already contains Unoform-specific styling
 */
function hasUnoformStyling(prompt: string): boolean {
  const unoformKeywords = [
    'unoform',
    'danish style',
    'scandinavian',
    'nordic design',
    'danish design',
    'scandinavian style',
    'danish craftsmanship'
  ];
  
  const lowercasePrompt = prompt.toLowerCase();
  return unoformKeywords.some(keyword => lowercasePrompt.includes(keyword));
}

/**
 * Determines the appropriate style descriptor based on the prompt content
 */
function getStyleDescriptor(prompt: string): string {
  const lowercasePrompt = prompt.toLowerCase();
  
  if (lowercasePrompt.includes('luxury') || lowercasePrompt.includes('premium') || lowercasePrompt.includes('high-end')) {
    return UNOFORM_STYLE_DESCRIPTORS.luxury;
  }
  
  if (lowercasePrompt.includes('traditional') || lowercasePrompt.includes('classic') || lowercasePrompt.includes('shaker')) {
    return UNOFORM_STYLE_DESCRIPTORS.traditional;
  }
  
  if (lowercasePrompt.includes('modern') || lowercasePrompt.includes('contemporary') || lowercasePrompt.includes('minimalist')) {
    return UNOFORM_STYLE_DESCRIPTORS.modern;
  }
  
  return UNOFORM_STYLE_DESCRIPTORS.default;
}

/**
 * Enhances a kitchen design prompt with Unoform styling
 */
export function enhancePromptWithUnoformStyle(
  originalPrompt: string,
  context?: 'generation' | 'inpainting' | 'variation'
): string {
  // Clean up the prompt
  const cleanPrompt = originalPrompt.trim();
  
  // If already has Unoform styling, return as-is
  if (hasUnoformStyling(cleanPrompt)) {
    return cleanPrompt;
  }
  
  // Get appropriate style descriptor
  const styleDescriptor = getStyleDescriptor(cleanPrompt);
  
  // Add context-specific enhancements
  let enhancedPrompt = cleanPrompt;
  
  switch (context) {
    case 'inpainting':
      // For inpainting, emphasize coherence with existing design
      enhancedPrompt = `${cleanPrompt}, maintaining consistent ${styleDescriptor}`;
      break;
      
    case 'variation':
      // For variations, emphasize style consistency
      enhancedPrompt = `${cleanPrompt}, ${styleDescriptor} with subtle variation`;
      break;
      
    case 'generation':
    default:
      // For generation, add comprehensive style guidance
      enhancedPrompt = `${cleanPrompt}, ${styleDescriptor}`;
      break;
  }
  
  return enhancedPrompt;
}

/**
 * Specifically designed for kitchen design prompts with material specifications
 */
export function enhanceKitchenPrompt(
  basePrompt: string,
  materials?: {
    cabinetStyle?: string;
    cabinetFinish?: string;
    countertop?: string;
    flooring?: string;
    wallColor?: string;
    hardware?: string;
  },
  context?: 'generation' | 'inpainting' | 'variation'
): string {
  let enhancedPrompt = basePrompt;
  
  // Add material quality descriptors that align with Unoform's brand
  if (materials) {
    const qualityEnhancements: string[] = [];
    
    if (materials.cabinetStyle) {
      qualityEnhancements.push('with precision-crafted cabinetry');
    }
    
    if (materials.countertop?.toLowerCase().includes('marble') || 
        materials.countertop?.toLowerCase().includes('granite') ||
        materials.countertop?.toLowerCase().includes('quartz')) {
      qualityEnhancements.push('featuring premium natural stone surfaces');
    }
    
    if (materials.hardware) {
      qualityEnhancements.push('with carefully selected high-quality hardware');
    }
    
    if (qualityEnhancements.length > 0) {
      enhancedPrompt = `${enhancedPrompt}, ${qualityEnhancements.join(', ')}`;
    }
  }
  
  return enhancePromptWithUnoformStyle(enhancedPrompt, context);
}

/**
 * Creates a variation of an existing prompt while maintaining Unoform style
 */
export function createStyleConsistentVariation(originalPrompt: string): string {
  const basePrompt = originalPrompt.replace(/, in Unoform signature Danish style.*$/i, '');
  const variationTerms = [
    'with alternative color palette',
    'with subtle material variations', 
    'with refined proportions',
    'with enhanced lighting design',
    'with optimized spatial flow'
  ];
  
  const randomVariation = variationTerms[Math.floor(Math.random() * variationTerms.length)];
  return enhancePromptWithUnoformStyle(`${basePrompt} ${randomVariation}`, 'variation');
}

/**
 * Validates that a prompt is appropriate for Unoform brand standards
 */
export function validatePromptForBrand(prompt: string): {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  const lowercasePrompt = prompt.toLowerCase();
  
  // Check for conflicting style keywords
  const conflictingStyles = ['rustic', 'industrial', 'bohemian', 'art deco', 'victorian'];
  conflictingStyles.forEach(style => {
    if (lowercasePrompt.includes(style)) {
      warnings.push(`"${style}" style may conflict with Unoform's Scandinavian aesthetic`);
      suggestions.push(`Consider using "modern Scandinavian" or "minimalist Danish" instead`);
    }
  });
  
  // Check for appropriate material mentions
  const appropriateMaterials = ['oak', 'birch', 'beech', 'maple', 'white', 'natural', 'stone', 'marble', 'steel'];
  const hasAppropriateMaterials = appropriateMaterials.some(material => 
    lowercasePrompt.includes(material)
  );
  
  if (!hasAppropriateMaterials && !lowercasePrompt.includes('material')) {
    suggestions.push('Consider specifying natural materials like oak, marble, or steel that align with Unoform\'s aesthetic');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  };
}

/**
 * Debug utility to show how a prompt will be enhanced
 */
export function debugPromptEnhancement(originalPrompt: string, context?: string) {
  if (process.env.NODE_ENV === 'development') {
    const enhanced = enhancePromptWithUnoformStyle(originalPrompt, context as any);
    console.log('Prompt Enhancement Debug:', {
      original: originalPrompt,
      enhanced: enhanced,
      context: context || 'default',
      hasExistingStyling: hasUnoformStyling(originalPrompt),
      styleDescriptor: getStyleDescriptor(originalPrompt)
    });
    return enhanced;
  }
  return enhancePromptWithUnoformStyle(originalPrompt, context as any);
}