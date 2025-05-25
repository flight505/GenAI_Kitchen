// Inpainting workflow types and interfaces

export interface InpaintIteration {
  id: string;
  imageUrl: string;
  maskUrl?: string;
  prompt: string;
  timestamp: number;
  parentId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: {
    brushSize?: number;
    maskOpacity?: number;
    region?: string;
    parameters?: Record<string, any>;
  };
  rating?: number;
  notes?: string;
}

export interface InpaintingWorkflowState {
  baseImage: string;
  isLocked: boolean;
  iterations: InpaintIteration[];
  currentIterationId?: string;
  maxIterations: number;
  branches: InpaintBranch[];
  comparisons: InpaintComparison[];
}

export interface InpaintBranch {
  id: string;
  name: string;
  parentIterationId: string;
  iterations: string[]; // iteration IDs
  createdAt: number;
  description?: string;
}

export interface InpaintComparison {
  id: string;
  iterationIds: string[];
  notes?: string;
  createdAt: number;
}

export interface MaskToolSettings {
  brushSize: number;
  brushOpacity: number;
  brushHardness: number;
  eraseMode: boolean;
  showMaskOverlay: boolean;
  maskColor: string;
  featherAmount: number;
  quickSelectionMode?: 'edges' | 'color' | 'none';
}

export interface InpaintRegionTemplate {
  id: string;
  name: string;
  description: string;
  maskPattern: string; // base64 or SVG
  commonPrompts: string[];
}

export interface InpaintingSession {
  id: string;
  workflowId: string;
  startTime: number;
  endTime?: number;
  totalIterations: number;
  acceptedIterationId?: string;
  exportFormats?: string[];
}

export type InpaintingMode = 'single' | 'iterative' | 'batch' | 'guided';

export interface InpaintingPreset {
  id: string;
  name: string;
  description: string;
  settings: {
    model: string;
    guidance: number;
    steps: number;
    maskSettings: Partial<MaskToolSettings>;
    commonRegions: string[];
  };
}

export interface IterationMetrics {
  iterationId: string;
  generationTime: number;
  similarity: number; // 0-1 similarity to base image
  maskCoverage: number; // percentage of image masked
  userRating?: number;
  autoQualityScore?: number;
}

// Actions for state management
export type InpaintingAction =
  | { type: 'SET_BASE_IMAGE'; payload: string }
  | { type: 'LOCK_BASE_IMAGE'; payload: boolean }
  | { type: 'ADD_ITERATION'; payload: InpaintIteration }
  | { type: 'UPDATE_ITERATION'; payload: { id: string; updates: Partial<InpaintIteration> } }
  | { type: 'SET_CURRENT_ITERATION'; payload: string }
  | { type: 'CREATE_BRANCH'; payload: { name: string; fromIterationId: string } }
  | { type: 'MERGE_BRANCHES'; payload: { branchIds: string[]; strategy: 'latest' | 'best' | 'manual' } }
  | { type: 'ADD_COMPARISON'; payload: { iterationIds: string[] } }
  | { type: 'RATE_ITERATION'; payload: { iterationId: string; rating: number } }
  | { type: 'EXPORT_ITERATION'; payload: { iterationId: string; format: string } }
  | { type: 'RESET_WORKFLOW' };