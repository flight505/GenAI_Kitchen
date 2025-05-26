/**
 * Model-specific type definitions for GenAI Kitchen
 */

export type ModelId = 'flux-canny-pro' | 'flux-1.1-pro' | 'flux-fill-pro' | 'flux-dev-inpainting' | 'flux-redux-dev';
export type ModelType = 'canny-pro' | 'flux-pro' | 'fill-pro' | 'redux';

export interface ModelConfiguration {
  id: ModelId;
  type: ModelType;
  name: string;
  version: string;
  description: string;
  capabilities: ModelCapability[];
  parameters: ModelParameters;
  costPerRun: number;
  averageTime: number;
  maxTimeout: number;
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
  image: string;
  prompt?: string;
  seed?: number;
  guidance?: number;
  steps?: number;
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