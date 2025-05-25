/**
 * Workflow-related type definitions for GenAI Kitchen
 */

import { ModelType } from './models';

export type WorkflowStep = 'upload' | 'design' | 'refine' | 'compare' | 'history';

export interface WorkflowState {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  baseImage: string | null;
  currentModel?: ModelType;
  iterations: InpaintIteration[];
  branches: WorkflowBranch[];
  checkpoints: WorkflowCheckpoint[];
  metadata: Record<string, any>;
  // Legacy fields - can be removed later
  currentStep?: WorkflowStep;
  completedSteps?: WorkflowStep[];
  workflowId?: string;
  startedAt?: number;
  lastModified?: number;
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
  baseImage: string;
  maskData: string;
  prompt: string;
  resultImage: string;
  createdAt: string;
  // Legacy fields
  beforeImage?: string;
  afterImage?: string;
  mask?: string;
  area?: string;
  timestamp?: number;
  isGenerating?: boolean;
  status?: 'pending' | 'success' | 'error';
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
  createdAt: string;
  fromIterationId?: string;
}

export interface WorkflowHistory {
  branches: WorkflowBranch[];
  currentBranchId: string;
  checkpoints: WorkflowCheckpoint[];
}

export interface WorkflowCheckpoint {
  id: string;
  name: string;
  workflowSnapshot: string;
  createdAt: string;
  // Legacy fields
  branchId?: string;
  imageId?: string;
  description?: string;
}

export interface WorkflowAnalytics {
  totalTime: number;
  stepTimes: Record<WorkflowStep, number>;
  modelUsage: Record<string, number>;
  successRate: number;
  iterationCount: number;
}