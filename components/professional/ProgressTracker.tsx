'use client';

import React from 'react';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

export interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  message?: string;
  progress?: number; // 0-100 for showing progress bars
  duration?: number; // Time taken in seconds
  details?: string[]; // Additional details for the step
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  currentStep?: number;
  className?: string;
}

export function ProgressTracker({ steps, currentStep = 0, className = '' }: ProgressTrackerProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 mb-4">Generation Progress</h3>
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = step.status === 'completed';
          const isPending = step.status === 'pending';
          const isError = step.status === 'error';

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : isActive ? (
                  <Loader2 className="h-5 w-5 text-unoform-gold animate-spin" />
                ) : isError ? (
                  <Circle className="h-5 w-5 text-red-600 fill-red-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${
                    isActive ? 'font-medium text-gray-900' : 
                    isCompleted ? 'text-gray-600' : 
                    isError ? 'text-red-600' :
                    'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  {step.duration && isCompleted && (
                    <span className="text-xs text-gray-500">{step.duration}s</span>
                  )}
                </div>
                
                {step.message && (
                  <p className="text-xs text-gray-500 mt-0.5">{step.message}</p>
                )}
                
                {/* Progress Bar for Active Steps */}
                {isActive && step.progress !== undefined && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-unoform-gold h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                )}
                
                {/* Additional Details */}
                {step.details && step.details.length > 0 && (isActive || isCompleted) && (
                  <ul className="mt-2 space-y-0.5">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="text-xs text-gray-500 flex items-start gap-1">
                        <span className="text-gray-400">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to create progress steps for different scenarios
export function createProgressSteps(scenario: 'style-transfer' | 'empty-room' | 'multi-reference' | 'batch-processing'): ProgressStep[] {
  switch (scenario) {
    case 'style-transfer':
      return [
        { id: 'upload', label: 'Processing source image', status: 'pending' },
        { id: 'analyze', label: 'Analyzing reference style', status: 'pending' },
        { id: 'generate', label: 'Applying style transfer', status: 'pending' },
        { id: 'finalize', label: 'Finalizing result', status: 'pending' }
      ];
    
    case 'empty-room':
      return [
        { id: 'upload', label: 'Processing room image', status: 'pending' },
        { id: 'depth', label: 'Extracting depth information', status: 'pending' },
        { id: 'generate', label: 'Generating kitchen design', status: 'pending' },
        { id: 'finalize', label: 'Applying finishing touches', status: 'pending' }
      ];
    
    case 'multi-reference':
      return [
        { id: 'upload', label: 'Processing target image', status: 'pending' },
        { id: 'ref1', label: 'Analyzing reference 1', status: 'pending' },
        { id: 'ref2', label: 'Analyzing reference 2', status: 'pending' },
        { id: 'ref3', label: 'Analyzing reference 3', status: 'pending' },
        { id: 'compose', label: 'Composing elements', status: 'pending' },
        { id: 'finalize', label: 'Finalizing composition', status: 'pending' }
      ];
    
    case 'batch-processing':
      return [
        { id: 'prepare', label: 'Preparing batch queue', status: 'pending' },
        { id: 'process', label: 'Processing images', status: 'pending' },
        { id: 'package', label: 'Packaging results', status: 'pending' }
      ];
  }
}

// Hook to manage progress state
export function useProgressTracker(scenario: 'style-transfer' | 'empty-room' | 'multi-reference' | 'batch-processing') {
  const [steps, setSteps] = React.useState<ProgressStep[]>(() => createProgressSteps(scenario));
  const [currentStep, setCurrentStep] = React.useState(0);

  const updateStep = React.useCallback((stepId: string, updates: Partial<ProgressStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  }, []);

  const nextStep = React.useCallback(() => {
    setSteps(prev => {
      const newSteps = [...prev];
      if (currentStep < newSteps.length) {
        newSteps[currentStep].status = 'completed';
        if (currentStep + 1 < newSteps.length) {
          newSteps[currentStep + 1].status = 'active';
        }
      }
      return newSteps;
    });
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  }, [currentStep, steps.length]);

  const reset = React.useCallback(() => {
    setSteps(createProgressSteps(scenario));
    setCurrentStep(0);
  }, [scenario]);

  const setError = React.useCallback((message: string) => {
    setSteps(prev => {
      const newSteps = [...prev];
      if (currentStep < newSteps.length) {
        newSteps[currentStep].status = 'error';
        newSteps[currentStep].message = message;
      }
      return newSteps;
    });
  }, [currentStep]);

  return {
    steps,
    currentStep,
    updateStep,
    nextStep,
    reset,
    setError
  };
}