'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  InformationCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  BookOpenIcon,
  PlayIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

interface InpaintingGuideProps {
  currentStep?: number;
  showByDefault?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
  workflow?: 'beginner' | 'advanced' | 'custom';
}

interface GuideStep {
  id: string;
  title: string;
  description: string;
  tips?: string[];
  warning?: string;
  completed?: boolean;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  steps: GuideStep[];
  bestFor: string[];
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'beginner',
    name: 'Beginner Workflow',
    description: 'Simple step-by-step process for first-time users',
    icon: AcademicCapIcon,
    bestFor: ['Learning the basics', 'Simple edits', 'Single area changes'],
    steps: [
      {
        id: 'upload',
        title: 'Start with your image',
        description: 'Make sure you have a generated kitchen design ready',
        tips: ['Use a high-quality image', 'Ensure good lighting']
      },
      {
        id: 'identify',
        title: 'Identify what to change',
        description: 'Look for specific areas that need refinement',
        tips: ['Start with small areas', 'Focus on one element at a time']
      },
      {
        id: 'mask',
        title: 'Draw your mask',
        description: 'Use the brush tool to paint over the area you want to change',
        tips: ['Be precise but not perfect', 'Use a larger brush for general areas', 'Zoom in for details']
      },
      {
        id: 'prompt',
        title: 'Describe the change',
        description: 'Write a clear prompt describing what you want',
        tips: ['Be specific', 'Mention materials and colors', 'Keep it simple']
      },
      {
        id: 'generate',
        title: 'Generate and evaluate',
        description: 'Review the result and decide if it meets your needs',
        tips: ['Compare with original', 'Check edges and blending', 'Rate the iteration']
      }
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced Workflow',
    description: 'Iterative refinement for professional results',
    icon: BookOpenIcon,
    bestFor: ['Complex edits', 'Multiple iterations', 'Professional projects'],
    steps: [
      {
        id: 'plan',
        title: 'Plan your iterations',
        description: 'Map out the changes you want to make in sequence',
        tips: ['Work from large to small', 'Group related changes']
      },
      {
        id: 'baseline',
        title: 'Establish baseline',
        description: 'Create your first iteration as a reference point',
        tips: ['Save important checkpoints', 'Document your settings']
      },
      {
        id: 'iterate',
        title: 'Iterative refinement',
        description: 'Make incremental improvements with each iteration',
        tips: ['Compare iterations side-by-side', 'Branch for experiments', 'Track what works']
      },
      {
        id: 'optimize',
        title: 'Optimize parameters',
        description: 'Fine-tune guidance and steps for better results',
        tips: ['Higher guidance for accuracy', 'More steps for quality', 'Balance speed vs quality']
      },
      {
        id: 'finalize',
        title: 'Finalize and export',
        description: 'Choose your best iteration and prepare for export',
        tips: ['Review all iterations', 'Get second opinions', 'Export at full quality']
      }
    ]
  }
];

const commonMistakes = [
  {
    mistake: 'Mask too large',
    solution: 'Keep masks focused on specific areas for better control',
    icon: ExclamationTriangleIcon
  },
  {
    mistake: 'Vague prompts',
    solution: 'Be specific about materials, colors, and styles',
    icon: ExclamationTriangleIcon
  },
  {
    mistake: 'Ignoring edges',
    solution: 'Use feathering and check blend quality at mask edges',
    icon: ExclamationTriangleIcon
  },
  {
    mistake: 'No iteration planning',
    solution: 'Think ahead about the sequence of changes',
    icon: ExclamationTriangleIcon
  }
];

const bestPractices = [
  'Start with small test areas to understand the model behavior',
  'Save masks for similar regions to reuse later',
  'Use reference images in your prompts when possible',
  'Review at different zoom levels to catch issues',
  'Take breaks between iterations to maintain fresh perspective'
];

export default function InpaintingGuide({
  currentStep = 0,
  showByDefault = false,
  onClose,
  onComplete,
  workflow = 'beginner'
}: InpaintingGuideProps) {
  const [isOpen, setIsOpen] = useState(showByDefault);
  const [selectedWorkflow, setSelectedWorkflow] = useState(workflow);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'tutorial' | 'tips' | 'templates'>('tutorial');
  
  const currentWorkflow = workflowTemplates.find(w => w.id === selectedWorkflow) || workflowTemplates[0];

  const handleStepComplete = useCallback((stepId: string) => {
    setCompletedSteps(prev => new Set(prev).add(stepId));
    
    // Check if all steps completed
    if (completedSteps.size + 1 === currentWorkflow.steps.length) {
      onComplete?.();
    }
  }, [completedSteps, currentWorkflow.steps.length, onComplete]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all"
        aria-label="Open inpainting guide"
      >
        <QuestionMarkCircleIcon className="w-6 h-6" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-4 top-20 bottom-4 w-96 bg-background border rounded-lg shadow-xl flex flex-col z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Inpainting Guide</h2>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('tutorial')}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === 'tutorial' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Tutorial
        </button>
        <button
          onClick={() => setActiveTab('tips')}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === 'tips' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Tips & Tricks
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === 'templates' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Templates
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'tutorial' && (
            <motion.div
              key="tutorial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-4"
            >
              {/* Workflow selector */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Workflow</label>
                <select
                  value={selectedWorkflow}
                  onChange={(e) => setSelectedWorkflow(e.target.value as any)}
                  className="w-full bg-background border rounded px-3 py-2 text-sm"
                >
                  {workflowTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {currentWorkflow.steps.map((step, index) => {
                  const isCompleted = completedSteps.has(step.id);
                  const isCurrent = index === currentStep;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`border rounded-lg p-3 transition-all ${
                        isCurrent ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-100 text-green-600' 
                            : isCurrent 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? (
                            <CheckCircleSolidIcon className="w-4 h-4" />
                          ) : (
                            <span className="text-xs">{index + 1}</span>
                          )}
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{step.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {step.description}
                          </p>

                          {step.tips && (
                            <div className="mt-2 space-y-1">
                              {step.tips.map((tip, tipIndex) => (
                                <div key={tipIndex} className="flex items-start gap-2 text-xs">
                                  <LightBulbIcon className="w-3 h-3 text-yellow-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-muted-foreground">{tip}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {step.warning && (
                            <div className="mt-2 flex items-start gap-2 text-xs">
                              <ExclamationTriangleIcon className="w-3 h-3 text-orange-600 flex-shrink-0 mt-0.5" />
                              <span className="text-orange-600">{step.warning}</span>
                            </div>
                          )}

                          {!isCompleted && (
                            <button
                              onClick={() => handleStepComplete(step.id)}
                              className="mt-2 text-xs text-primary hover:underline"
                            >
                              Mark as complete
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {completedSteps.size} / {currentWorkflow.steps.length}
                  </span>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(completedSteps.size / currentWorkflow.steps.length) * 100}%` 
                    }}
                    transition={{ type: 'spring', damping: 20 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tips' && (
            <motion.div
              key="tips"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-4"
            >
              {/* Common Mistakes */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-orange-600" />
                  Common Mistakes
                </h3>
                <div className="space-y-3">
                  {commonMistakes.map((item, index) => (
                    <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <h4 className="font-medium text-sm text-orange-900">{item.mistake}</h4>
                      <p className="text-sm text-orange-700 mt-1">{item.solution}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Practices */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  Best Practices
                </h3>
                <div className="space-y-2">
                  {bestPractices.map((practice, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{practice}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Metrics */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <ChartBarIcon className="w-4 h-4 text-blue-600" />
                  Success Metrics
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                  <p className="text-sm text-blue-900">A successful iteration typically has:</p>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Seamless edge blending</li>
                    <li>Consistent lighting and shadows</li>
                    <li>Matching perspective and scale</li>
                    <li>Appropriate material textures</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-4"
            >
              {workflowTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedWorkflow(template.id as any);
                      setActiveTab('tutorial');
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-8 h-8 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Best for:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.bestFor.map((use, index) => (
                              <span
                                key={index}
                                className="text-xs bg-muted px-2 py-0.5 rounded"
                              >
                                {use}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}

              {/* Quick Actions */}
              <div className="pt-4 border-t space-y-2">
                <button className="w-full text-sm py-2 px-3 bg-muted hover:bg-muted/80 rounded transition-colors flex items-center justify-center gap-2">
                  <PlayIcon className="w-4 h-4" />
                  Watch Video Tutorial
                </button>
                <button className="w-full text-sm py-2 px-3 bg-muted hover:bg-muted/80 rounded transition-colors flex items-center justify-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  Download Guide PDF
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}