/**
 * Workflow presets and constants
 */

import { WorkflowStep } from '../types/workflow';

export const WORKFLOW_STEPS: Record<WorkflowStep, { 
  label: string; 
  description: string; 
  icon: string;
  order: number;
}> = {
  upload: {
    label: 'Upload',
    description: 'Upload your kitchen photo',
    icon: 'ArrowUpTrayIcon',
    order: 1
  },
  design: {
    label: 'Design',
    description: 'Choose materials and style',
    icon: 'PaintBrushIcon',
    order: 2
  },
  refine: {
    label: 'Refine',
    description: 'Edit specific areas',
    icon: 'PencilIcon',
    order: 3
  },
  compare: {
    label: 'Compare',
    description: 'View all variations',
    icon: 'EyeIcon',
    order: 4
  },
  history: {
    label: 'History',
    description: 'Review your workflow',
    icon: 'ClockIcon',
    order: 5
  }
};

export const WORKFLOW_PRESETS = {
  quickRedesign: {
    name: 'Quick Redesign',
    description: 'Fast kitchen refresh with style preservation',
    steps: ['upload', 'design', 'compare'],
    defaultModel: 'canny-pro',
    estimatedTime: 5
  },
  completeTransform: {
    name: 'Complete Transform',
    description: 'Full kitchen makeover with creative freedom',
    steps: ['upload', 'design', 'refine', 'compare'],
    defaultModel: 'flux-pro',
    estimatedTime: 15
  },
  iterativeRefinement: {
    name: 'Iterative Refinement',
    description: 'Perfect specific details through multiple edits',
    steps: ['upload', 'design', 'refine', 'refine', 'compare'],
    defaultModel: 'canny-pro',
    estimatedTime: 20
  }
};

export const WORKFLOW_TIPS = {
  upload: [
    'Use well-lit photos for best results',
    'Capture the full kitchen space',
    'Avoid extreme angles or distortion'
  ],
  design: [
    'Start with "Keep Structure" mode',
    'Try different material combinations',
    'Save designs you like for comparison'
  ],
  refine: [
    'Draw masks carefully around areas to change',
    'Use specific prompts for better results',
    'Try multiple iterations for perfect results'
  ],
  compare: [
    'Use side-by-side view for detailed comparison',
    'Rate designs to track preferences',
    'Export your favorites for sharing'
  ],
  history: [
    'Create checkpoints before major changes',
    'Use branching for different design directions',
    'Export workflows to reuse later'
  ]
};

export const DEFAULT_WORKFLOW_STATE = {
  currentStep: 'upload' as WorkflowStep,
  completedSteps: [] as WorkflowStep[],
  workflowId: '',
  startedAt: Date.now(),
  lastModified: Date.now()
};

export const WORKFLOW_STORAGE_KEY = 'genai_kitchen_workflow';
export const WORKFLOW_HISTORY_KEY = 'genai_kitchen_history';
export const WORKFLOW_PREFERENCES_KEY = 'genai_kitchen_preferences';