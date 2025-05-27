'use client';

import React, { useState, useCallback } from 'react';
import { UploadDropzone } from '@bytescale/upload-widget-react';
import { UploadWidgetConfig } from '@bytescale/upload-widget';
import { useImageHistory } from '@/hooks/useImageHistory';
import downloadPhoto from '@/utils/downloadPhoto';
import { CompareSlider } from '@/components/CompareSlider';
import Toast from '@/components/Toast';
import { MODEL_CONFIGS } from '@/constants/models';
import { 
  Play,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Upload as UploadIcon,
  Grid3x3,
  List
} from 'lucide-react';

interface ProfessionalInterfaceV2Props {
  scenario?: string;
}

interface WorkflowState {
  selectedModel: string;
  parameters: Record<string, any>;
  sourceImage: string | null;
  isProcessing: boolean;
  resultImage: string | null;
  prompt: string;
}

// Simplified model configurations for the UI
const modelUIConfigs = {
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

export function ProfessionalInterfaceV2({ }: ProfessionalInterfaceV2Props) {
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
  
  const [state, setState] = useState<WorkflowState>({
    selectedModel: 'flux-canny-pro',
    parameters: {
      steps: 50,
      guidance: 30
    },
    sourceImage: null,
    isProcessing: false,
    resultImage: null,
    prompt: 'modern Scandinavian kitchen with light oak cabinets, white marble countertops, minimalist design'
  });

  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; url: string; name: string }>>([]);

  const handleParameterChange = useCallback((key: string, value: number) => {
    setState(prev => ({
      ...prev,
      parameters: { ...prev.parameters, [key]: value }
    }));
  }, []);

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

    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const modelConfig = modelUIConfigs[state.selectedModel as keyof typeof modelUIConfigs];
      const response = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrl: state.sourceImage,
          prompt: state.prompt,
          model: modelConfig.type,
          ...state.parameters
        })
      });

      if (response.status === 429) {
        throw new Error("You've reached the daily limit. Please try again tomorrow.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Generation failed');
      }

      const result = await response.json();
      const imageUrl = typeof result === 'string' ? result : result[0];
      
      setState(prev => ({ ...prev, resultImage: imageUrl }));
      
      addToHistory({
        url: imageUrl,
        prompt: state.prompt,
        type: 'generated'
      });
      
      setToast({ message: 'Image generated successfully!', type: 'success' });
      
    } catch (error) {
      console.error('Generation error:', error);
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

  const currentModel = modelUIConfigs[state.selectedModel as keyof typeof modelUIConfigs];
  const currentImage = getCurrentImage();
  const displayImage = state.resultImage || currentImage?.url;

  return (
    <div className="h-full flex bg-white">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select 
                value={state.selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-unoform-gold focus:border-transparent"
              >
                {Object.entries(modelUIConfigs).map(([key, config]) => (
                  <option key={key} value={key}>{config.name}</option>
                ))}
              </select>
              
              <div className="text-sm text-gray-600">
                Cost: <span className="font-medium text-gray-900">${currentModel.cost}/image</span>
              </div>

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
              {displayImage && (
                <button
                  onClick={() => downloadPhoto(displayImage, 'genai-kitchen-pro.jpg')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Download result"
                >
                  <Download className="h-4 w-4" />
                </button>
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

        {/* Canvas Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {displayImage && state.sourceImage ? (
              <CompareSlider
                original={state.sourceImage}
                restored={displayImage}
              />
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {/* Source Image */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Source Image</h3>
                  <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {state.sourceImage ? (
                      <img src={state.sourceImage} alt="Source" className="w-full h-full object-cover" />
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

      {/* Right Panel - Simple Image Library */}
      <div className="w-80 border-l border-gray-200 bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-900">Recent Uploads</h2>
            <div className="flex items-center gap-2">
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
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}