/**
 * Model-specific type definitions for GenAI Kitchen
 */

export type ModelId = 'flux-canny-pro' | 'flux-1.1-pro' | 'flux-fill-pro' | 'flux-dev-inpainting' | 'flux-redux-dev' | 'flux-depth-dev';
export type ModelType = 'canny-pro' | 'flux-pro' | 'fill-pro' | 'redux' | 'style-transfer' | 'depth-guided';
export type ScenarioType = 'style-transfer' | 'empty-room' | 'multi-reference';

export interface ModelConfiguration {
  id: ModelId;
  type: ModelType;
  name: string;
  version: string;
  replicateId: string; // Full Replicate model ID (e.g., "black-forest-labs/flux-1.1-pro")
  description: string;
  capabilities: ModelCapability[];
  parameters: ModelParameters;
  costPerRun: number;
  averageTime: number;
  maxTimeout: number;
  supportedScenarios?: ScenarioType[];
  performance?: {
    quality: 'draft' | 'standard' | 'high';
    speed: 'fast' | 'normal' | 'slow';
  };
}

export interface ModelCapability {
  name: string;
  description: string;
  icon?: string;
}

export interface ModelParameters {
  required: ParameterDefinition[];
  optional: ParameterDefinition[];
  defaults: Record<string, any>;
}

export interface ParameterDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'file' | 'select';
  description: string;
  min?: number;
  max?: number;
  options?: string[];
  default?: any;
}

export interface ModelSelectionContext {
  currentModel: ModelType;
  previousModel?: ModelType;
  reason?: string;
  timestamp: number;
}

export interface ModelComparisonResult {
  modelA: ModelType;
  modelB: ModelType;
  imageA: string;
  imageB: string;
  prompt: string;
  parameters: Record<string, any>;
  userPreference?: 'A' | 'B' | 'neutral';
  notes?: string;
}

// Specific model input types
export interface FluxCannyProInput {
  prompt: string;
  control_image: string;
  guidance?: number;
  steps?: number;
  safety_tolerance?: number;
  seed?: number;
  output_format?: 'png' | 'jpg';
}

export interface Flux11ProInput {
  prompt: string;
  aspect_ratio?: string;
  width?: number;
  height?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  safety_tolerance?: number;
  output_format?: 'webp' | 'jpg' | 'png';
}

export interface FluxFillProInput {
  image: string;
  mask: string;
  prompt: string;
  guidance?: number;
  steps?: number;
  safety_tolerance?: number;
  output_format?: 'png' | 'jpg';
}

export interface FluxReduxInput {
  redux_image: string;
  prompt?: string;
  seed?: number;
  guidance?: number;
  num_outputs?: number;
  aspect_ratio?: string;
  output_format?: string;
  output_quality?: number;
  num_inference_steps?: number;
  megapixels?: string;
}

export interface FluxDevInpaintingInput {
  image: string;
  mask: string;
  prompt: string;
  guidance_scale?: number;
  num_inference_steps?: number;
  strength?: number;
  seed?: number;
  output_format?: 'png' | 'jpg';
}