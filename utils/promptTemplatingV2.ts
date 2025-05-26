/**
 * Enhanced Prompt Templating with Unoform Style System Integration
 * Bridges the old system with the new comprehensive style system
 */

import { 
  UnoformStyle, 
  PromptBuildingContext,
  MaterialSelection,
  MoodSelection 
} from '../types/unoform-styles';
import { buildUnoformPrompt } from './unoformPromptBuilder';
import { KitchenDesignSelections } from './kitchenTypes';

/**
 * Convert old kitchen selections to new style system context
 */
export function convertSelectionsToContext(
  selections: KitchenDesignSelections,
  modelType: 'canny-pro' | 'flux-pro' = 'canny-pro'
): PromptBuildingContext {
  // Map cabinet style to Unoform style
  const styleMapping: Record<string, UnoformStyle> = {
    'Modern Flat-Panel': 'avantgarde',
    'Classic Shaker': 'shaker',
    'Minimalist Slab': 'avantgarde',
    'Glass-Front Modern': 'copenhagen'
  };

  const unoformStyle = styleMapping[selections.cabinetStyle] || 'classic';

  // Convert cabinet finish to material
  const material = convertFinishToMaterial(selections.cabinetFinish);

  // Determine mood based on selections
  const mood: MoodSelection = {
    lighting: selections.wallColor.includes('White') || selections.wallColor.includes('Light') 
      ? 'natural' 
      : 'ambient',
    atmosphere: selections.cabinetStyle.includes('Slab') || selections.cabinetStyle.includes('Two-Tone')
      ? 'modern'
      : selections.cabinetStyle.includes('Shaker') || selections.cabinetStyle.includes('Distressed')
      ? 'warm'
      : 'sophisticated'
  };

  // Build context
  const context: PromptBuildingContext = {
    style: unoformStyle,
    material,
    features: extractFeatures(selections, unoformStyle),
    details: extractDetails(selections),
    mood,
    modelType,
    customerPhoto: true
  };

  return context;
}

/**
 * Convert cabinet finish to material selection
 */
function convertFinishToMaterial(finish: string): MaterialSelection {
  // Wood finishes
  const woodFinishes = ['Natural Wood', 'Walnut', 'Oak', 'Cherry', 'Maple', 'Birch', 'Mahogany'];
  if (woodFinishes.some(wood => finish.includes(wood))) {
    const woodType = finish.toLowerCase().replace('natural wood', 'oak').replace(' ', '-');
    return {
      type: 'wood',
      name: woodType,
      descriptor: getWoodDescriptor(woodType),
      appearance: getWoodAppearance(woodType)
    };
  }

  // Paint finishes
  return {
    type: 'paint',
    name: finish.toLowerCase(),
    descriptor: getPaintDescriptor(finish),
    appearance: []
  };
}

/**
 * Extract features based on selections and style
 */
function extractFeatures(selections: KitchenDesignSelections, style: UnoformStyle): string[] {
  const features: string[] = [];

  // Style-specific features
  switch (style) {
    case 'classic':
      features.push('horizontal slatted drawer fronts');
      features.push('thick frames');
      features.push('floating base');
      break;
    case 'copenhagen':
      features.push('exposed drawer boxes');
      features.push('visible interior');
      features.push('modular gaps');
      break;
    case 'shaker':
      features.push('frame-and-panel doors');
      features.push('recessed panels');
      features.push('traditional proportions');
      break;
    case 'avantgarde':
      features.push('flat surfaces');
      features.push('minimal gaps');
      features.push('handleless design');
      break;
  }

  // Add countertop as feature
  if (selections.countertop) {
    features.push(`${selections.countertop.toLowerCase()} countertops`);
  }

  return features;
}

/**
 * Extract details from selections
 */
function extractDetails(selections: KitchenDesignSelections): string[] {
  const details: string[] = [];

  // Hardware details
  if (selections.hardware) {
    details.push(`${selections.hardware.toLowerCase()} hardware`);
  }

  // Flooring details
  if (selections.flooring) {
    details.push(`${selections.flooring.toLowerCase()} flooring`);
  }

  // Wall color details
  if (selections.wallColor) {
    details.push(`${selections.wallColor.toLowerCase()} walls`);
  }

  return details;
}

/**
 * Get wood descriptor helper
 */
function getWoodDescriptor(wood: string): string {
  const descriptors: Record<string, string> = {
    'walnut': 'rich dark',
    'oak': 'warm honey',
    'cherry': 'deep reddish',
    'maple': 'light creamy',
    'birch': 'pale smooth',
    'mahogany': 'luxurious dark'
  };
  return descriptors[wood] || 'natural';
}

/**
 * Get wood appearance helper
 */
function getWoodAppearance(wood: string): string[] {
  const appearances: Record<string, string[]> = {
    'walnut': ['chocolate tones', 'swirling grain'],
    'oak': ['golden hues', 'prominent grain'],
    'cherry': ['warm undertones', 'fine grain'],
    'maple': ['subtle grain', 'uniform color'],
    'birch': ['smooth texture', 'minimal grain'],
    'mahogany': ['rich patina', 'straight grain']
  };
  return appearances[wood] || [];
}

/**
 * Get paint descriptor helper
 */
function getPaintDescriptor(paint: string): string {
  if (paint.includes('Matte')) return 'velvety matte';
  if (paint.includes('Gloss')) return 'sleek high-gloss';
  if (paint.includes('White')) return 'crisp';
  if (paint.includes('Gray') || paint.includes('Grey')) return 'sophisticated';
  if (paint.includes('Blue')) return 'serene';
  if (paint.includes('Green')) return 'calming';
  if (paint.includes('Black')) return 'dramatic';
  return 'smooth';
}

/**
 * Enhanced prompt generation using the new system
 */
export function generateEnhancedPrompt(
  selections: KitchenDesignSelections,
  modelType: 'canny-pro' | 'flux-pro' = 'canny-pro',
  customStyle?: UnoformStyle
): string {
  // Convert selections to context
  let context = convertSelectionsToContext(selections, modelType);
  
  // Override style if provided
  if (customStyle) {
    context = { ...context, style: customStyle };
  }

  // Build prompt using the new system
  return buildUnoformPrompt(context);
}

/**
 * Get style recommendations based on selections
 */
export function getStyleRecommendations(selections: KitchenDesignSelections): {
  recommended: UnoformStyle;
  reasoning: string;
  alternatives: Array<{ style: UnoformStyle; reason: string }>;
} {
  // Analyze selections
  const isModern = ['Modern Flat-Panel', 'Minimalist Slab', 'Matte White', 'Black Gloss'].some(
    term => selections.cabinetStyle.includes(term) || selections.cabinetFinish.includes(term)
  );
  
  const isTraditional = ['Classic Shaker', 'Natural Oak Wood', 'Walnut Veneer'].some(
    term => selections.cabinetStyle.includes(term) || selections.cabinetFinish.includes(term)
  );

  const isMinimal = ['Glass-Front Modern', 'Minimalist Slab', 'Matte White', 'Bright White'].some(
    term => selections.cabinetStyle.includes(term) || 
           selections.cabinetFinish.includes(term) || 
           selections.wallColor.includes(term)
  );

  // Determine recommended style
  let recommended: UnoformStyle = 'classic';
  let reasoning = '';

  if (isModern && isMinimal) {
    recommended = 'avantgarde';
    reasoning = 'Your selections indicate a preference for ultra-modern, minimalist design';
  } else if (isMinimal && selections.cabinetStyle.includes('Glass')) {
    recommended = 'copenhagen';
    reasoning = 'Open shelving and minimal aesthetic align perfectly with Copenhagen style';
  } else if (isTraditional && selections.cabinetStyle === 'Classic Shaker') {
    recommended = 'shaker';
    reasoning = 'Shaker cabinets are the defining feature of this timeless style';
  } else {
    recommended = 'classic';
    reasoning = 'Classic style offers timeless elegance that works with your selections';
  }

  // Generate alternatives
  const alternatives: Array<{ style: UnoformStyle; reason: string }> = [];
  
  if (recommended !== 'classic') {
    alternatives.push({
      style: 'classic',
      reason: 'Versatile style that works with any material choice'
    });
  }
  
  if (recommended !== 'copenhagen' && isMinimal) {
    alternatives.push({
      style: 'copenhagen',
      reason: 'Perfect for showcasing organized storage and craftsmanship'
    });
  }
  
  if (recommended !== 'avantgarde' && isModern) {
    alternatives.push({
      style: 'avantgarde',
      reason: 'Ultimate in modern minimalism and architectural precision'
    });
  }

  return { recommended, reasoning, alternatives };
}

/**
 * Validate prompt against style requirements
 */
export function validatePromptAgainstStyle(
  prompt: string,
  style: UnoformStyle
): {
  isValid: boolean;
  missingKeywords: string[];
  conflictingTerms: string[];
  suggestions: string[];
} {
  const styleData = require('../constants/unoform-styles').UNOFORM_STYLES[style];
  const lowercasePrompt = prompt.toLowerCase();

  // Check for required keywords
  const missingKeywords: string[] = [];
  styleData.validation.mustHave.forEach((rule: any) => {
    const hasKeyword = rule.keywords.some((kw: string) => 
      lowercasePrompt.includes(kw.toLowerCase())
    );
    if (!hasKeyword) {
      missingKeywords.push(rule.keywords[0]);
    }
  });

  // Check for conflicting terms
  const conflictingTerms: string[] = [];
  styleData.validation.mustNotHave.forEach((rule: any) => {
    rule.keywords.forEach((kw: string) => {
      if (lowercasePrompt.includes(kw.toLowerCase())) {
        conflictingTerms.push(kw);
      }
    });
  });

  // Generate suggestions
  const suggestions: string[] = [];
  if (missingKeywords.length > 0) {
    suggestions.push(`Add these keywords: ${missingKeywords.join(', ')}`);
  }
  if (conflictingTerms.length > 0) {
    suggestions.push(`Remove these terms: ${conflictingTerms.join(', ')}`);
  }

  return {
    isValid: missingKeywords.length === 0 && conflictingTerms.length === 0,
    missingKeywords,
    conflictingTerms,
    suggestions
  };
}