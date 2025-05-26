/**
 * Unoform Style System Type Definitions
 * Comprehensive type system for kitchen styles, validation, and prompt building
 */

export type UnoformStyle = 'classic' | 'copenhagen' | 'shaker' | 'avantgarde';

export interface StyleValidationRule {
  category: 'mustHave' | 'shouldHave' | 'mustNotHave';
  description: string;
  keywords: string[];
  visualMarkers?: string[];
}

export interface StyleDefinition {
  id: UnoformStyle;
  name: string;
  description: string;
  validation: {
    mustHave: StyleValidationRule[];
    shouldHave: StyleValidationRule[];
    mustNotHave: StyleValidationRule[];
  };
  promptFormula: string;
  primaryDescriptors: Record<string, string[] | any>;
  spatialRelationships: string[];
  materialCompatibility: {
    woods: string[];
    woodDescriptions?: Record<string, string>;
    paints: string[];
    paintFinishes?: Record<string, string>;
    finishes?: string[];
    metals: string[];
    countertops: string[];
    colorPalette?: string[];
  };
}

export interface PromptLayer {
  layer: 1 | 2 | 3 | 4 | 5;
  name: string;
  content: string;
  required: boolean;
}

export interface PromptBuildingContext {
  style: UnoformStyle;
  material: MaterialSelection;
  features: string[];
  details: string[];
  mood: MoodSelection;
  modelType: 'canny-pro' | 'flux-pro';
  customerPhoto?: boolean;
}

export interface MaterialSelection {
  type: 'wood' | 'paint' | 'metal' | 'composite';
  name: string;
  descriptor: string;
  appearance: string[];
}

export interface MoodSelection {
  lighting: 'natural' | 'ambient' | 'dramatic' | 'even';
  atmosphere: 'minimalist' | 'warm' | 'sophisticated' | 'modern';
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  violations: {
    rule: StyleValidationRule;
    severity: 'critical' | 'major' | 'minor';
    message: string;
  }[];
  suggestions: string[];
  missingElements: string[];
}

export interface PromptEnhancement {
  original: string;
  enhanced: string;
  additions: string[];
  removals: string[];
  modelOptimizations: string[];
}

export interface StyleCompatibilityMatrix {
  style: UnoformStyle;
  compatibleMaterials: MaterialSelection[];
  incompatibleCombinations: string[];
  recommendations: string[];
}

export interface CustomerPreference {
  stylePreference?: UnoformStyle;
  materialPreferences: string[];
  colorScheme: 'light' | 'dark' | 'neutral' | 'warm' | 'cool';
  functionality: string[];
  avoidList: string[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  style: UnoformStyle;
  basePrompt: string;
  variables: Record<string, string>;
  tags: string[];
  successRate?: number;
}