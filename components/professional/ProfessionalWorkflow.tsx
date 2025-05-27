'use client';

import React, { useState, useCallback } from 'react';
import { ModelHub } from './ModelHub';
import { ParameterPanel } from './ParameterPanel';
import { ImageLibrary } from './ImageLibrary';
import { ScenarioType } from '@/types/models';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Save, 
  Play,
  Pause,
  StopCircle,
  Layers,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';

interface ProfessionalWorkflowProps {
  scenario?: ScenarioType;
}

interface WorkflowState {
  selectedModel: string;
  parameters: Record<string, any>;
  selectedImages: any[];
  isProcessing: boolean;
  currentStep: number;
}

export function ProfessionalWorkflow({ scenario = 'style-transfer' }: ProfessionalWorkflowProps) {
  const [state, setState] = useState<WorkflowState>({
    selectedModel: 'flux-redux-dev',
    parameters: {},
    selectedImages: [],
    isProcessing: false,
    currentStep: 0
  });

  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // Mock projects data - in real app, this would come from a store or API
  const mockProjects = [
    {
      id: '1',
      name: 'Modern Kitchen Redesign',
      images: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const handleModelSelect = useCallback((modelId: string) => {
    setState(prev => ({ ...prev, selectedModel: modelId }));
  }, []);

  const handleParametersChange = useCallback((params: Record<string, any>) => {
    setState(prev => ({ ...prev, parameters: params }));
  }, []);

  const handleImageSelect = useCallback((images: any[], mode: 'primary' | 'reference') => {
    setState(prev => ({ ...prev, selectedImages: images }));
  }, []);

  const handleGenerate = async () => {
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      // Call the appropriate API based on scenario
      const endpoint = scenario === 'empty-room' ? '/api/empty-room' : '/api/style-transfer';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: state.selectedModel,
          parameters: state.parameters,
          images: state.selectedImages,
          scenario
        })
      });

      if (!response.ok) throw new Error('Generation failed');
      
      const result = await response.json();
      console.log('Generation result:', result);
      
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const getScenarioSteps = () => {
    switch (scenario) {
      case 'style-transfer':
        return ['Select Model', 'Choose Images', 'Set Parameters', 'Generate'];
      case 'empty-room':
        return ['Select Model', 'Upload Room', 'Configure Space', 'Generate'];
      case 'multi-reference':
        return ['Select Model', 'Add References', 'Set Weights', 'Generate'];
      default:
        return ['Select Model', 'Configure', 'Generate'];
    }
  };

  const steps = getScenarioSteps();

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Left Panel - Model Selection */}
      <div className={`
        border-r bg-gray-900 border-gray-800 transition-all duration-300
        ${leftPanelCollapsed ? 'w-12' : 'w-96'}
      `}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            {!leftPanelCollapsed && (
              <h2 className="font-semibold text-gray-100">Model & Parameters</h2>
            )}
            <button
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-100 transition-colors"
            >
              {leftPanelCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
          
          {!leftPanelCollapsed && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                <ModelHub
                  onModelSelect={handleModelSelect}
                  currentModelId={state.selectedModel}
                  scenario={scenario}
                />
                
                <div className="border-t pt-6">
                  <ParameterPanel
                    modelId={state.selectedModel}
                    onChange={handleParametersChange}
                    scenario={scenario}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {scenario.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')} Workflow
              </h1>
              <p className="text-gray-600 mt-1">
                Professional kitchen design generation
              </p>
            </div>
            
            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${index === state.currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : index < state.currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {index < state.currentStep ? '✓' : index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-1 ${
                      index < state.currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex">
          {/* Canvas Area */}
          <div className="flex-1 p-6">
            <div className="h-full bg-white rounded-lg shadow-sm border p-6">
              {scenario === 'style-transfer' && (
                <StyleTransferCanvas
                  images={state.selectedImages}
                  isProcessing={state.isProcessing}
                />
              )}
              
              {scenario === 'empty-room' && (
                <EmptyRoomCanvas
                  images={state.selectedImages}
                  parameters={state.parameters}
                  isProcessing={state.isProcessing}
                />
              )}
              
              {scenario === 'multi-reference' && (
                <MultiReferenceCanvas
                  images={state.selectedImages}
                  parameters={state.parameters}
                  isProcessing={state.isProcessing}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Image Library */}
          <div className={`
            border-l bg-white transition-all duration-300
            ${rightPanelCollapsed ? 'w-12' : 'w-96'}
          `}>
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <button
                  onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {rightPanelCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {!rightPanelCollapsed && (
                  <h2 className="font-semibold">Image Library</h2>
                )}
              </div>
              
              {!rightPanelCollapsed && (
                <div className="flex-1 overflow-hidden p-4">
                  <ImageLibrary
                    projects={mockProjects}
                    onImageSelect={handleImageSelect}
                    selectionMode={scenario === 'multi-reference' ? 'multiple' : 'single'}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white border-t px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Model: {state.selectedModel}</span>
              <span>•</span>
              <span>Images: {state.selectedImages.length}</span>
              <span>•</span>
              <span>Ready to generate</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Configuration
              </button>
              
              <button
                onClick={handleGenerate}
                disabled={state.isProcessing || state.selectedImages.length === 0}
                className={`
                  px-6 py-2 rounded-lg font-medium flex items-center gap-2
                  ${state.isProcessing || state.selectedImages.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }
                `}
              >
                {state.isProcessing ? (
                  <>
                    <Pause className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Canvas Components for different scenarios
function StyleTransferCanvas({ images, isProcessing }: any) {
  return (
    <div className="h-full flex items-center justify-center">
      {images.length === 0 ? (
        <div className="text-center text-gray-500">
          <Sparkles className="h-12 w-12 mx-auto mb-3" />
          <p className="text-lg font-medium">Select images to start</p>
          <p className="text-sm mt-1">Choose a source image and style reference</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 max-w-4xl w-full">
          <div className="space-y-2">
            <h3 className="font-medium">Source Image</h3>
            <div className="aspect-[16/9] bg-gray-100 rounded-lg flex items-center justify-center">
              {images[0] ? (
                <img src={images[0].url} alt="Source" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Style Reference</h3>
            <div className="aspect-[16/9] bg-gray-100 rounded-lg flex items-center justify-center">
              {images[1] ? (
                <img src={images[1].url} alt="Reference" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Layers className="h-8 w-8 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyRoomCanvas({ images, parameters, isProcessing }: any) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-4">Empty Room Projection</h3>
        {images.length > 0 ? (
          <div className="aspect-[16/9] max-w-2xl mx-auto bg-gray-100 rounded-lg">
            <img src={images[0].url} alt="Empty room" className="w-full h-full object-cover rounded-lg" />
          </div>
        ) : (
          <div className="text-gray-500">
            <p>Upload an empty room photo to visualize kitchen installation</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MultiReferenceCanvas({ images, parameters, isProcessing }: any) {
  return (
    <div className="h-full">
      <h3 className="text-lg font-medium mb-4">Reference Images</h3>
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map(index => (
          <div key={index} className="space-y-2">
            <h4 className="text-sm font-medium">Reference {index + 1}</h4>
            <div className="aspect-[16/9] bg-gray-100 rounded-lg flex items-center justify-center">
              {images[index] ? (
                <img src={images[index].url} alt={`Reference ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}