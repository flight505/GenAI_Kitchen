'use client';

import React, { useState, useCallback } from 'react';
import { UploadDropzone } from '@bytescale/upload-widget-react';
import { UploadWidgetConfig } from '@bytescale/upload-widget';
import { useImageHistory } from '@/hooks/useImageHistory';
import downloadPhoto from '@/utils/downloadPhoto';
import { imageCache } from '@/utils/imageCache';
import { requestDebouncer } from '@/utils/requestDebouncer';
import { CompareSlider } from '@/components/CompareSlider';
import Toast from '@/components/Toast';
import { MODEL_CONFIGS } from '@/constants/models';
import { ScenarioSelector, ScenarioType } from './ScenarioSelector';
import { ReferenceImageManager, ReferenceImage } from './ReferenceImageManager';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../ui/resizable';
import { ProgressTracker, useProgressTracker } from './ProgressTracker';
import { PerspectiveGuides } from './PerspectiveGuides';
import { CostEstimator } from './CostEstimator';
import { PresetTemplates, PresetTemplate } from './PresetTemplates';
import { ExportTemplates, ExportData } from './ExportTemplates';
import { CacheStatus } from './CacheStatus';
import BatchProcessing from './BatchProcessing';
import { 
  Play,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Upload as UploadIcon,
  Grid3x3,
  List,
  Maximize2,
  Minimize2,
  Eye,
  Sparkles,
  X,
  Beaker
} from 'lucide-react';

interface ProfessionalInterfaceV2Props {
  initialScenario?: ScenarioType;
}

interface WorkflowState {
  scenario: ScenarioType;
  selectedModel: string;
  parameters: Record<string, any>;
  sourceImage: string | null;
  referenceImages: ReferenceImage[];
  isProcessing: boolean;
  resultImage: string | null;
  prompt: string;
  roomDimensions?: { width: number; height: number; depth: number };
  lightingCondition?: 'natural' | 'evening' | 'bright';
}

// Model configurations per scenario
const scenarioModels: Record<ScenarioType, string[]> = {
  'style-transfer': ['interior-design', 'instant-id', 'flux-redux-dev', 'flux-canny-pro'],
  'empty-room': ['flux-depth-dev', 'interior-design', 'flux-1.1-pro'],
  'multi-reference': ['interior-design', 'instant-id', 'flux-redux-dev', 'flux-1.1-pro-ultra'],
  'batch-processing': ['interior-design', 'flux-redux-dev', 'flux-canny-pro']
};

// Simplified model configurations for the UI
const modelUIConfigs = {
  'interior-design': {
    name: 'Interior Design AI',
    cost: 0.008,
    type: 'interior-specialized',
    parameters: {
      guidance_scale: { min: 1, max: 20, default: 7.5, step: 0.5, label: 'Guidance' },
      prompt_strength: { min: 0, max: 1, default: 0.8, step: 0.1, label: 'Strength' },
      num_inference_steps: { min: 20, max: 50, default: 30, label: 'Steps' }
    }
  },
  'instant-id': {
    name: 'InstantID + IP-Adapter',
    cost: 0.01,
    type: 'ip-adapter',
    parameters: {
      ip_adapter_scale: { min: 0, max: 1, default: 0.8, step: 0.1, label: 'Style Strength' },
      controlnet_conditioning_scale: { min: 0, max: 1, default: 0.8, step: 0.1, label: 'Structure' },
      guidance_scale: { min: 1, max: 10, default: 5, step: 0.5, label: 'Guidance' }
    }
  },
  'flux-canny-pro': {
    name: 'FLUX Canny Pro',
    cost: MODEL_CONFIGS['flux-canny-pro'].costPerRun,
    type: 'canny-pro',
    parameters: {
      steps: { min: 15, max: 50, default: 50, label: 'Quality' },
      guidance: { min: 1, max: 100, default: 30, step: 1, label: 'Guidance' }
    }
  },
  'flux-1.1-pro': {
    name: 'FLUX 1.1 Pro',
    cost: MODEL_CONFIGS['flux-1.1-pro'].costPerRun,
    type: 'flux-pro',
    parameters: {
      width: { min: 256, max: 1440, default: 1344, step: 32, label: 'Width' },
      height: { min: 256, max: 1440, default: 768, step: 32, label: 'Height' }
    }
  },
  'flux-redux-dev': {
    name: 'FLUX Redux',
    cost: MODEL_CONFIGS['flux-redux-dev'].costPerRun,
    type: 'style-transfer',
    parameters: {
      guidance: { min: 0, max: 10, default: 3, step: 0.5, label: 'Style Strength' },
      num_inference_steps: { min: 1, max: 50, default: 28, label: 'Steps' }
    }
  },
  'flux-depth-dev': {
    name: 'FLUX Depth',
    cost: MODEL_CONFIGS['flux-depth-dev'].costPerRun,
    type: 'depth',
    parameters: {
      guidance_scale: { min: 1, max: 10, default: 3.5, step: 0.5, label: 'Guidance' },
      num_inference_steps: { min: 1, max: 50, default: 28, label: 'Steps' }
    }
  },
  'flux-1.1-pro-ultra': {
    name: 'FLUX Pro Ultra',
    cost: MODEL_CONFIGS['flux-1.1-pro-ultra'].costPerRun,
    type: 'flux-pro-ultra',
    parameters: {
      safety_tolerance: { min: 1, max: 6, default: 2, label: 'Safety' },
      raw: { type: 'boolean', default: false, label: 'Photorealistic' }
    }
  }
};

// Upload widget configuration
const uploadOptions: UploadWidgetConfig = {
  apiKey: process.env.NEXT_PUBLIC_UPLOAD_API_KEY || "free",
  maxFileCount: 1,
  mimeTypes: ["image/jpeg", "image/png", "image/jpg"],
  styles: {
    colors: {
      primary: "#C19A5B"
    }
  }
};

export function ProfessionalInterfaceV2({ initialScenario = 'style-transfer' }: ProfessionalInterfaceV2Props) {
  const { 
    history, 
    addToHistory, 
    currentIndex, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    getCurrentImage 
  } = useImageHistory();
  
  const progressTracker = useProgressTracker(initialScenario);
  
  const [state, setState] = useState<WorkflowState>({
    scenario: initialScenario,
    selectedModel: scenarioModels[initialScenario][0],
    parameters: {
      guidance: 3,
      num_inference_steps: 28
    },
    sourceImage: null,
    referenceImages: [],
    isProcessing: false,
    resultImage: null,
    prompt: 'modern Scandinavian kitchen with light oak cabinets, white marble countertops, minimalist design'
  });

  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; url: string; name: string }>>([]);
  const [showReferencePanel, setShowReferencePanel] = useState(true);
  const [showPerspectiveGuides, setShowPerspectiveGuides] = useState(false);
  const [showPresets, setShowPresets] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleScenarioChange = useCallback((scenario: ScenarioType) => {
    const availableModels = scenarioModels[scenario];
    const defaultModel = availableModels[0];
    const modelConfig = modelUIConfigs[defaultModel as keyof typeof modelUIConfigs];
    
    // Reset parameters to defaults for new model
    const defaultParams: Record<string, any> = {};
    if (modelConfig?.parameters) {
      Object.entries(modelConfig.parameters).forEach(([key, config]: [string, any]) => {
        defaultParams[key] = config.default;
      });
    }
    
    setState(prev => ({
      ...prev,
      scenario,
      selectedModel: defaultModel,
      parameters: defaultParams,
      referenceImages: [] // Clear reference images when switching scenarios
    }));
    
    // Reset progress tracker for new scenario
    progressTracker.reset();
  }, [progressTracker]);

  const handleParameterChange = useCallback((key: string, value: number | boolean) => {
    setState(prev => ({
      ...prev,
      parameters: { ...prev.parameters, [key]: value }
    }));
    
    // If auto-generate is enabled (future feature), debounce the generation
    // This prevents excessive API calls while user is adjusting sliders
    const debounceKey = `param-change-${state.scenario}-${state.selectedModel}`;
    requestDebouncer.cancel(debounceKey); // Cancel any pending auto-generation
  }, [state.scenario, state.selectedModel]);

  const handleModelChange = useCallback((modelKey: string) => {
    const modelConfig = modelUIConfigs[modelKey as keyof typeof modelUIConfigs];
    if (modelConfig) {
      // Reset parameters to defaults for new model
      const defaultParams: Record<string, any> = {};
      if (modelConfig.parameters) {
        Object.entries(modelConfig.parameters).forEach(([key, config]: [string, any]) => {
          defaultParams[key] = config.default;
        });
      }
      setState(prev => ({
        ...prev,
        selectedModel: modelKey,
        parameters: defaultParams
      }));
    }
  }, []);

  const handleImageUpload = useCallback((uploadedFiles: any[]) => {
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0];
      const imageUrl = file.fileUrl;
      const imageName = file.originalFileName || 'Uploaded image';
      
      setState(prev => ({ ...prev, sourceImage: imageUrl }));
      
      // Add to uploaded images list
      setUploadedImages(prev => [...prev, {
        id: `img-${Date.now()}`,
        url: imageUrl,
        name: imageName
      }]);
      
      // Add to history
      addToHistory({
        url: imageUrl,
        type: 'original'
      });
      
      setToast({ message: 'Image uploaded successfully', type: 'success' });
    }
  }, [addToHistory]);

  const handleGenerate = async () => {
    if (!state.sourceImage) {
      setToast({ message: 'Please upload an image first', type: 'warning' });
      return;
    }

    // Validate scenario-specific requirements
    if (state.scenario === 'style-transfer' && state.referenceImages.length === 0) {
      setToast({ message: 'Please add at least one reference image', type: 'warning' });
      return;
    }

    if (state.scenario === 'multi-reference' && state.referenceImages.length < 2) {
      setToast({ message: 'Please add at least 2 reference images for multi-reference', type: 'warning' });
      return;
    }

    // Generate cache key
    const cacheKey = imageCache.generateKey({
      sourceImage: state.sourceImage,
      prompt: state.prompt,
      model: state.selectedModel,
      parameters: state.parameters,
      referenceImages: state.referenceImages.map(img => img.url)
    });

    // Check cache first
    const cachedResult = imageCache.get(cacheKey);
    if (cachedResult) {
      setState(prev => ({ ...prev, resultImage: cachedResult }));
      setToast({ 
        message: 'Image retrieved from cache', 
        type: 'info' 
      });
      return;
    }

    // Check if request was made very recently (prevent double-clicks)
    if (imageCache.hasRecentRequest(cacheKey, 1000)) {
      setToast({ 
        message: 'Please wait - request already in progress', 
        type: 'warning' 
      });
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true }));
    progressTracker.reset();
    
    // Start progress tracking with detailed initial step
    const startTime = Date.now();
    if (progressTracker.steps.length > 0) {
      progressTracker.steps[0].status = 'active';
      progressTracker.steps[0].progress = 0;
      progressTracker.steps[0].details = ['Validating inputs', 'Preparing request'];
    }
    
    try {
      // Initial processing step with progress updates
      setTimeout(() => {
        if (progressTracker.steps[0]) {
          progressTracker.steps[0].progress = 50;
          progressTracker.steps[0].details?.push('Input validation complete');
        }
      }, 100);
      
      let endpoint = '/generate';
      let requestBody: any = {
        imageUrl: state.sourceImage,
        prompt: state.prompt,
        model: modelUIConfigs[state.selectedModel as keyof typeof modelUIConfigs].type,
        ...state.parameters
      };

      // Determine endpoint and body based on scenario
      switch (state.scenario) {
        case 'style-transfer':
          endpoint = '/api/style-transfer';
          requestBody = {
            sourceImage: state.sourceImage,
            referenceImage: state.referenceImages[0]?.url,
            scenario: state.scenario,
            model: modelUIConfigs[state.selectedModel as keyof typeof modelUIConfigs].type,
            parameters: {
              ...state.parameters,
              prompt: state.prompt
            }
          };
          progressTracker.steps[0].details?.push(`Using ${modelUIConfigs[state.selectedModel as keyof typeof modelUIConfigs].name} model`);
          break;
          
        case 'empty-room':
          endpoint = '/api/empty-room';
          requestBody = {
            emptyRoom: state.sourceImage,
            parameters: {
              ...state.parameters,
              prompt: state.prompt,
              roomDimensions: state.roomDimensions,
              lightingCondition: state.lightingCondition || 'natural'
            }
          };
          progressTracker.steps[0].details?.push(`Room: ${state.roomDimensions?.width || 4}m × ${state.roomDimensions?.depth || 3}m`);
          progressTracker.steps[0].details?.push(`Lighting: ${state.lightingCondition || 'natural'}`);
          break;
          
        case 'multi-reference':
          endpoint = '/api/multi-reference';
          requestBody = {
            targetImage: state.sourceImage,
            referenceImages: state.referenceImages,
            parameters: {
              ...state.parameters,
              prompt: state.prompt
            }
          };
          progressTracker.steps[0].details?.push(`Processing ${state.referenceImages.length} reference images`);
          break;
      }

      // Complete first step and move to API call
      progressTracker.steps[0].progress = 100;
      progressTracker.steps[0].duration = (Date.now() - startTime) / 1000;
      progressTracker.nextStep();
      
      // Start API call step with progress simulation
      const apiStartTime = Date.now();
      if (progressTracker.steps[1]) {
        progressTracker.steps[1].progress = 0;
        progressTracker.steps[1].details = ['Sending request to API', 'Waiting for model initialization'];
      }
      
      // Simulate progress during API call
      const progressInterval = setInterval(() => {
        if (progressTracker.steps[1] && progressTracker.steps[1].status === 'active') {
          const currentProgress = progressTracker.steps[1].progress || 0;
          if (currentProgress < 90) {
            progressTracker.steps[1].progress = Math.min(currentProgress + 10, 90);
            
            // Add status updates based on progress
            if (currentProgress === 20) {
              progressTracker.steps[1].details?.push('Model loaded');
            } else if (currentProgress === 50) {
              progressTracker.steps[1].details?.push('Processing image');
            } else if (currentProgress === 80) {
              progressTracker.steps[1].details?.push('Finalizing generation');
            }
          }
        }
      }, 1000);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      // Clear interval and complete API step
      clearInterval(progressInterval);
      if (progressTracker.steps[1]) {
        progressTracker.steps[1].progress = 100;
        progressTracker.steps[1].duration = (Date.now() - apiStartTime) / 1000;
        progressTracker.steps[1].details?.push('API call completed');
      }
      
      // Move to processing step
      progressTracker.nextStep();
      const processingStartTime = Date.now();
      if (progressTracker.steps[2]) {
        progressTracker.steps[2].progress = 0;
        progressTracker.steps[2].details = ['Parsing response', 'Validating output'];
      }

      if (response.status === 429) {
        throw new Error("You've reached the daily limit. Please try again tomorrow.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Generation failed');
      }

      const result = await response.json();
      const imageUrl = result.finalImage || result.imageUrl || (typeof result === 'string' ? result : result[0]);
      
      if (progressTracker.steps[2]) {
        progressTracker.steps[2].progress = 50;
        progressTracker.steps[2].details?.push('Image URL received');
      }
      
      setState(prev => ({ ...prev, resultImage: imageUrl }));
      
      // Cache the result
      imageCache.set(cacheKey, imageUrl, {
        model: state.selectedModel,
        prompt: state.prompt,
        parameters: state.parameters
      });
      
      addToHistory({
        url: imageUrl,
        prompt: state.prompt,
        type: 'generated'
      });
      
      if (progressTracker.steps[2]) {
        progressTracker.steps[2].progress = 100;
        progressTracker.steps[2].duration = (Date.now() - processingStartTime) / 1000;
        progressTracker.steps[2].details?.push('Image saved to history');
      }
      
      // Complete final step
      progressTracker.nextStep();
      if (progressTracker.steps[3]) {
        progressTracker.steps[3].duration = (Date.now() - startTime) / 1000;
        progressTracker.steps[3].details = [
          `Total time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`,
          `Model: ${modelUIConfigs[state.selectedModel as keyof typeof modelUIConfigs].name}`,
          'Generation successful',
          'Result cached for future use'
        ];
      }
      
      setToast({ 
        message: result.warning || 'Image generated successfully!', 
        type: result.warning ? 'warning' : 'success' 
      });
      
    } catch (error) {
      console.error('Generation error:', error);
      progressTracker.setError(error instanceof Error ? error.message : 'Generation failed');
      setToast({ 
        message: error instanceof Error ? error.message : 'Generation failed', 
        type: 'error' 
      });
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleUndo = useCallback(() => {
    const previousImage = undo();
    if (previousImage) {
      setState(prev => ({ ...prev, resultImage: previousImage.url }));
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const nextImage = redo();
    if (nextImage) {
      setState(prev => ({ ...prev, resultImage: nextImage.url }));
    }
  }, [redo]);

  const handleImageSelect = useCallback((image: { url: string }) => {
    setState(prev => ({ ...prev, sourceImage: image.url }));
  }, []);

  const handlePresetSelect = useCallback((preset: PresetTemplate) => {
    // Apply preset parameters
    setState(prev => ({
      ...prev,
      prompt: preset.prompt,
      parameters: { ...prev.parameters, ...preset.parameters },
      roomDimensions: preset.parameters.roomDimensions || prev.roomDimensions,
      lightingCondition: preset.parameters.lightingCondition || prev.lightingCondition
    }));
    
    // Show success toast
    setToast({ 
      message: `Applied "${preset.name}" template`, 
      type: 'success' 
    });
    
    // Optionally close presets panel after selection
    setTimeout(() => setShowPresets(false), 1000);
  }, []);

  const currentModel = modelUIConfigs[state.selectedModel as keyof typeof modelUIConfigs];
  const currentImage = getCurrentImage();
  const displayImage = state.resultImage || currentImage?.url;
  const availableModels = scenarioModels[state.scenario];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Scenario Selector */}
      <ScenarioSelector 
        activeScenario={state.scenario}
        onChange={handleScenarioChange}
      />
      
      {/* Main Content Area */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Preset Templates */}
        {showPresets && (
          <>
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <div className="h-full border-r border-gray-200 bg-gray-50 flex flex-col">
                <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gray-900">Templates</h2>
                  <button
                    onClick={() => setShowPresets(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Hide templates"
                  >
                    <Minimize2 className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <PresetTemplates
                    scenario={state.scenario}
                    onSelect={handlePresetSelect}
                  />
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}
        
        {/* Center Panel - Main Workspace */}
        <ResizablePanel defaultSize={showPresets ? (showReferencePanel ? 55 : 80) : (showReferencePanel ? 75 : 100)} minSize={50}>
          <div className="h-full flex flex-col">
            {/* Top Bar */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <select 
                    value={state.selectedModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-unoform-gold focus:border-transparent"
                  >
                    {availableModels.map(modelKey => {
                      const config = modelUIConfigs[modelKey as keyof typeof modelUIConfigs];
                      return config ? (
                        <option key={modelKey} value={modelKey}>{config.name}</option>
                      ) : null;
                    })}
                  </select>
                  
                  <div className="text-sm text-gray-600">
                    Model: <span className="font-medium text-gray-900">{currentModel.name}</span>
                  </div>

                  {/* Cache Status */}
                  <CacheStatus className="ml-4" />

                  {/* History Navigation */}
                  <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo (Ctrl+Z)"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">
                  {history.length > 0 ? `${currentIndex + 1}/${history.length}` : '0/0'}
                </span>
                <button
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Redo (Ctrl+Y)"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
                </div>

                <div className="flex items-center gap-3">
                  {!showPresets && (
                    <button
                      onClick={() => setShowPresets(true)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Show templates"
                    >
                      <Sparkles className="h-4 w-4" />
                    </button>
                  )}
                  
                  {displayImage && (
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Export options"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  
                  {/* Test Button - Only show in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <a
                      href="/professional/test"
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Test with Unoform catalog"
                    >
                      <Beaker className="h-4 w-4" />
                    </a>
                  )}
                  
                  <button
                    onClick={handleGenerate}
                    disabled={state.isProcessing || !state.sourceImage}
                    className="px-4 py-2 bg-unoform-gold text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {state.isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
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

        {/* Parameters Bar */}
        {currentModel.parameters && (
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center gap-8">
              {Object.entries(currentModel.parameters).map(([key, config]: [string, any]) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="text-sm text-gray-600">{config.label}</label>
                  {config.type === 'boolean' ? (
                    <input
                      type="checkbox"
                      checked={state.parameters[key] || config.default}
                      onChange={(e) => handleParameterChange(key, e.target.checked)}
                      className="h-4 w-4 text-unoform-gold focus:ring-unoform-gold border-gray-300 rounded"
                    />
                  ) : (
                    <>
                      <input
                        type="range"
                        min={config.min}
                        max={config.max}
                        step={config.step || 1}
                        value={state.parameters[key] || config.default}
                        onChange={(e) => handleParameterChange(key, Number(e.target.value))}
                        className="w-32"
                      />
                      <span className="text-sm font-medium text-gray-900 w-12">
                        {state.parameters[key] || config.default}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Input */}
        <div className="px-6 py-3 border-b border-gray-200">
          <input
            type="text"
            value={state.prompt}
            onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
            placeholder="Describe your kitchen design..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-unoform-gold focus:border-transparent"
          />
        </div>

        {/* Room Dimensions for Empty Room Scenario */}
        {state.scenario === 'empty-room' && (
          <div className="px-6 py-3 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <h3 className="text-sm font-medium text-gray-700">Room Dimensions:</h3>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Width (m)</label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    step="0.1"
                    value={state.roomDimensions?.width || 4}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      roomDimensions: {
                        ...prev.roomDimensions,
                        width: parseFloat(e.target.value) || 4,
                        height: prev.roomDimensions?.height || 2.5,
                        depth: prev.roomDimensions?.depth || 3
                      }
                    }))}
                    className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-unoform-gold focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Height (m)</label>
                  <input
                    type="number"
                    min="2"
                    max="4"
                    step="0.1"
                    value={state.roomDimensions?.height || 2.5}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      roomDimensions: {
                        ...prev.roomDimensions,
                        width: prev.roomDimensions?.width || 4,
                        height: parseFloat(e.target.value) || 2.5,
                        depth: prev.roomDimensions?.depth || 3
                      }
                    }))}
                    className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-unoform-gold focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Depth (m)</label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    step="0.1"
                    value={state.roomDimensions?.depth || 3}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      roomDimensions: {
                        ...prev.roomDimensions,
                        width: prev.roomDimensions?.width || 4,
                        height: prev.roomDimensions?.height || 2.5,
                        depth: parseFloat(e.target.value) || 3
                      }
                    }))}
                    className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-unoform-gold focus:border-transparent"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Area: {((state.roomDimensions?.width || 4) * (state.roomDimensions?.depth || 3)).toFixed(1)} m²
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Lighting:</label>
                  <select 
                    value={state.lightingCondition || 'natural'}
                    onChange={(e) => setState(prev => ({ 
                      ...prev, 
                      lightingCondition: e.target.value as 'natural' | 'evening' | 'bright' 
                    }))}
                    className="text-sm border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-unoform-gold focus:border-transparent"
                  >
                    <option value="natural">Natural Daylight</option>
                    <option value="evening">Evening Ambient</option>
                    <option value="bright">Bright Studio</option>
                  </select>
                </div>
                
                <button
                  onClick={() => setShowPerspectiveGuides(!showPerspectiveGuides)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    showPerspectiveGuides 
                      ? 'bg-unoform-gold text-white' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  Perspective Guides
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Progress Tracker - Show when processing */}
            {state.isProcessing && (
              <div className="mb-6">
                <ProgressTracker 
                  steps={progressTracker.steps} 
                  currentStep={progressTracker.currentStep}
                />
              </div>
            )}
            
            {state.scenario === 'batch-processing' ? (
              <BatchProcessing
                styleReference={state.referenceImages[0]?.url}
                prompt={state.prompt}
                parameters={state.parameters}
                setToast={setToast}
                onComplete={(results) => {
                  setToast({ 
                    message: `Batch processing complete! ${results.length} images processed.`, 
                    type: 'success' 
                  });
                }}
              />
            ) : displayImage && state.sourceImage ? (
              <CompareSlider
                original={state.sourceImage}
                restored={displayImage}
              />
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {/* Source Image */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Source Image</h3>
                  <div className="relative aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {state.sourceImage ? (
                      <>
                        <img src={state.sourceImage} alt="Source" className="w-full h-full object-cover" />
                        {state.scenario === 'empty-room' && (
                          <PerspectiveGuides
                            imageUrl={state.sourceImage}
                            visible={showPerspectiveGuides}
                            onToggle={() => setShowPerspectiveGuides(false)}
                          />
                        )}
                      </>
                    ) : (
                      <UploadDropzone
                        options={uploadOptions}
                        onUpdate={({ uploadedFiles }) => {
                          if (uploadedFiles.length > 0) {
                            handleImageUpload(uploadedFiles);
                          }
                        }}
                        height="100%"
                        width="100%"
                      />
                    )}
                  </div>
                </div>

                {/* Result */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Result</h3>
                  <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {displayImage ? (
                      <img src={displayImage} alt="Result" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-500">
                        <p className="text-sm">Result will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ResizablePanel>

        {/* Right Panel - Reference Images or Recent Uploads */}
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={showReferencePanel ? 25 : 20} minSize={15} maxSize={40}>
          {(state.scenario === 'style-transfer' || state.scenario === 'multi-reference') && showReferencePanel ? (
          <div className="h-full border-l border-gray-200 bg-gray-50 flex flex-col">
            <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-900">Reference Manager</h2>
              <button
                onClick={() => setShowReferencePanel(false)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Hide reference panel"
              >
                <Minimize2 className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 flex flex-col">
              <ReferenceImageManager
                scenario={state.scenario}
                maxImages={state.scenario === 'style-transfer' ? 1 : 3}
                images={state.referenceImages}
                onImagesChange={(images) => setState(prev => ({ ...prev, referenceImages: images }))}
              />
              
              {/* Cost Estimator */}
              <div className="p-4 border-t border-gray-200">
                <CostEstimator
                  scenario={state.scenario}
                  selectedModel={state.selectedModel}
                  referenceCount={state.scenario === 'multi-reference' ? state.referenceImages.length : 1}
                  isProcessing={state.isProcessing}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full border-l border-gray-200 bg-gray-50 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-900">Recent Uploads</h2>
                <div className="flex items-center gap-2">
                  {(state.scenario === 'style-transfer' || state.scenario === 'multi-reference') && !showReferencePanel && (
                    <button
                      onClick={() => setShowReferencePanel(true)}
                      className="p-1.5 hover:bg-gray-100 rounded"
                      title="Show reference panel"
                    >
                      <Maximize2 className="h-4 w-4 text-gray-600" />
                    </button>
                  )}
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="p-1.5 hover:bg-gray-100 rounded"
                    title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                  >
                    {viewMode === 'grid' ? <List className="h-4 w-4 text-gray-600" /> : <Grid3x3 className="h-4 w-4 text-gray-600" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
              {uploadedImages.length === 0 ? (
                <div className="text-center py-8">
                  <UploadIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">No images uploaded yet</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-3">
                  {uploadedImages.map(img => (
                    <button
                      key={img.id}
                      onClick={() => handleImageSelect(img)}
                      className={`aspect-video bg-gray-200 rounded hover:ring-2 hover:ring-unoform-gold transition-all overflow-hidden ${
                        state.sourceImage === img.url ? 'ring-2 ring-unoform-gold' : ''
                      }`}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {uploadedImages.map(img => (
                    <button
                      key={img.id}
                      onClick={() => handleImageSelect(img)}
                      className={`w-full flex items-center gap-3 p-2 hover:bg-white rounded transition-colors ${
                        state.sourceImage === img.url ? 'bg-white ring-1 ring-unoform-gold' : ''
                      }`}
                    >
                      <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 truncate">{img.name}</p>
                        <p className="text-xs text-gray-500">1344 × 768</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Cost Estimator in Recent Uploads View */}
            <div className="p-4 border-t border-gray-200 mt-auto">
              <CostEstimator
                scenario={state.scenario}
                selectedModel={state.selectedModel}
                referenceCount={state.scenario === 'multi-reference' ? state.referenceImages.length : 1}
                isProcessing={state.isProcessing}
              />
            </div>
          </div>
        )}
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Export Modal */}
      {showExportModal && displayImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Export Your Design</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <ExportTemplates
                data={{
                  sourceImage: state.sourceImage || undefined,
                  resultImage: displayImage,
                  scenario: state.scenario,
                  model: state.selectedModel,
                  parameters: state.parameters,
                  prompt: state.prompt,
                  timestamp: new Date(),
                  cost: currentModel.cost,
                  processingTime: progressTracker.steps[3]?.duration,
                  referenceImages: state.referenceImages.map(img => ({
                    url: img.url,
                    role: img.role
                  }))
                }}
                onExport={(template) => {
                  setToast({
                    message: `${template.name} exported successfully`,
                    type: 'success'
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}