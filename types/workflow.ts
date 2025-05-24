/**
 * Workflow-related type definitions for GenAI Kitchen
 */

export type WorkflowStep = 'upload' | 'design' | 'refine' | 'compare' | 'history';

export interface WorkflowState {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  workflowId: string;
  startedAt: number;
  lastModified: number;
}

export interface WorkflowImage {
  id: string;
  url: string;
  type: 'original' | 'generated' | 'inpainted' | 'variation';
  prompt?: string;
  model?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface InpaintIteration {
  id: string;
  beforeImage: string;
  afterImage?: string;
  mask: string;
  prompt: string;
  area: string; // User-friendly name like "Cabinets"
  timestamp: number;
  isGenerating: boolean;
  status: 'pending' | 'success' | 'error';
}

export interface InpaintingWorkflowState {
  mode: 'drawing' | 'prompting' | 'generating' | 'comparing' | 'complete';
  baseImage: string; // Locked when entering inpaint mode
  iterations: InpaintIteration[];
  activeIteration: number;
  canExit: boolean; // Prevents accidental loss of work
}

export interface WorkflowBranch {
  id: string;
  parentId?: string;
  name: string;
  images: WorkflowImage[];
  createdAt: number;
}

export interface WorkflowHistory {
  branches: WorkflowBranch[];
  currentBranchId: string;
  checkpoints: WorkflowCheckpoint[];
}

export interface WorkflowCheckpoint {
  id: string;
  branchId: string;
  imageId: string;
  name: string;
  description?: string;
  createdAt: number;
}

export interface WorkflowAnalytics {
  totalTime: number;
  stepTimes: Record<WorkflowStep, number>;
  modelUsage: Record<string, number>;
  successRate: number;
  iterationCount: number;
}