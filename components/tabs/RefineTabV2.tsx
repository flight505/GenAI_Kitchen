'use client';

import { useState, useCallback, useEffect } from 'react';
import { useInpaintWorkflowStore } from '../../store/inpaintWorkflowStore';
import InpaintingLayout from '../inpaint/InpaintingLayout';
import InpaintStepper from '../inpaint/InpaintStepper';
import ModernInpaintUI from '../ModernInpaintUI';
import { CompareSlider } from '../CompareSlider';
import StyleTransferPanel from '../style-transfer/StyleTransferPanel';
import { PhotoIcon, SparklesIcon, PaintBrushIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import type { InpaintIteration } from '../../types/inpainting';

type RefineMode = 'inpaint' | 'style-transfer';

interface RefineTabV2Props {
  restoredImage: string | null;
  inpaintPrompt: string;
  setInpaintPrompt: (prompt: string) => void;
  inpainting: boolean;
  inpaintPhoto: (maskDataUrl: string) => Promise<void>;
}

export function RefineTabV2({
  restoredImage,
  inpaintPrompt,
  setInpaintPrompt,
  inpainting,
  inpaintPhoto,
}: RefineTabV2Props) {
  const {
    baseImage,
    iterations,
    currentIterationId,
    setBaseImage,
    addIteration,
    updateIteration,
    setCurrentIteration,
    acceptIteration,
    startSession,
    endSession,
    maskSettings,
    updateMaskSettings
  } = useInpaintWorkflowStore();

  const [compareMode, setCompareMode] = useState<'slider' | 'sideBySide' | 'overlay'>('slider');
  const [selectedCompareId, setSelectedCompareId] = useState<string | null>(null);
  const [refineMode, setRefineMode] = useState<RefineMode>('inpaint');
  const [styleTransferResult, setStyleTransferResult] = useState<string | null>(null);

  // Initialize workflow when component mounts with a restored image
  useEffect(() => {
    if (restoredImage && restoredImage !== baseImage) {
      setBaseImage(restoredImage);
      startSession('workflow-' + Date.now());
    }
  }, [restoredImage, baseImage, setBaseImage, startSession]);

  const currentIteration = iterations.find(i => i.id === currentIterationId);
  const compareIteration = iterations.find(i => i.id === selectedCompareId);

  // Handle new inpaint operation
  const handleInpaint = useCallback(async (maskUrl: string, prompt: string) => {
    const iterationId = addIteration({
      imageUrl: baseImage,
      maskUrl,
      prompt,
      status: 'processing',
      parentId: currentIterationId,
      metadata: {
        brushSize: maskSettings.brushSize,
        maskOpacity: maskSettings.brushOpacity,
        parameters: {
          guidance: 30,
          steps: 50
        }
      }
    });

    try {
      await inpaintPhoto(maskUrl);
      // The actual image update will come from the parent component
      updateIteration(iterationId, { status: 'completed' });
    } catch (error) {
      updateIteration(iterationId, { 
        status: 'failed',
        notes: error instanceof Error ? error.message : 'Inpainting failed'
      });
    }
  }, [baseImage, currentIterationId, maskSettings, addIteration, updateIteration, inpaintPhoto]);

  // Handle iteration actions
  const handleIterationClick = useCallback((id: string) => {
    setCurrentIteration(id);
    const iteration = iterations.find(i => i.id === id);
    if (iteration?.prompt) {
      setInpaintPrompt(iteration.prompt);
    }
  }, [iterations, setCurrentIteration, setInpaintPrompt]);

  const handleIterationEdit = useCallback((id: string, updates: Partial<InpaintIteration>) => {
    updateIteration(id, updates);
  }, [updateIteration]);

  const handleIterationDelete = useCallback((id: string) => {
    // In a real implementation, we'd also clean up the associated images
    const newIterations = iterations.filter(i => i.id !== id);
    if (currentIterationId === id && newIterations.length > 0) {
      setCurrentIteration(newIterations[newIterations.length - 1].id);
    }
  }, [iterations, currentIterationId, setCurrentIteration]);

  const handleIterationDuplicate = useCallback((id: string) => {
    const iteration = iterations.find(i => i.id === id);
    if (iteration) {
      addIteration({
        ...iteration,
        status: 'pending',
        notes: `Duplicated from ${iteration.metadata.region || 'iteration'}`
      });
    }
  }, [iterations, addIteration]);

  // Handle style transfer completion
  const handleStyleTransferComplete = useCallback((resultImage: string, metadata: any) => {
    setStyleTransferResult(resultImage);
    // Add as a new iteration
    const iterationId = addIteration({
      imageUrl: resultImage,
      maskUrl: '',
      prompt: `Style transfer from ${metadata.referenceImage}`,
      status: 'completed',
      parentId: currentIterationId,
      metadata: {
        type: 'style-transfer',
        ...metadata
      }
    });
    setCurrentIteration(iterationId);
  }, [addIteration, currentIterationId, setCurrentIteration]);

  if (!restoredImage) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center p-8">
          <PhotoIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-work font-medium text-unoform-gray-dark mb-4">
            Refine Your Design
          </h2>
          <p className="text-unoform-gray mb-6">
            Generate a kitchen design first, then use this tab to refine specific areas with iterative inpainting.
          </p>
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('tab', 'design');
              window.history.pushState({}, '', url);
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="btn-default"
          >
            Go to Design Tab
          </button>
        </div>
      </div>
    );
  }

  // Left Panel: Iteration Stepper
  const leftPanel = (
    <div className="h-full p-4 overflow-hidden">
      <InpaintStepper
        iterations={iterations}
        currentIterationId={currentIterationId}
        onIterationClick={handleIterationClick}
        onIterationEdit={handleIterationEdit}
        onIterationDelete={handleIterationDelete}
        onIterationDuplicate={handleIterationDuplicate}
      />
    </div>
  );

  // Center Panel: Inpainting Canvas or Style Transfer
  const centerPanel = (
    <div className="h-full p-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setRefineMode('inpaint')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            refineMode === 'inpaint'
              ? 'bg-[#C19A5B] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <PaintBrushIcon className="w-4 h-4" />
          <span>Inpaint</span>
        </button>
        <button
          onClick={() => setRefineMode('style-transfer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            refineMode === 'style-transfer'
              ? 'bg-[#C19A5B] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ArrowsRightLeftIcon className="w-4 h-4" />
          <span>Style Transfer</span>
        </button>
      </div>

      {/* Content based on mode */}
      {refineMode === 'inpaint' ? (
        <ModernInpaintUI
          imageUrl={currentIteration?.imageUrl || baseImage}
          onMaskGenerated={handleInpaint}
          isProcessing={inpainting}
        />
      ) : (
        <StyleTransferPanel
          targetImage={currentIteration?.imageUrl || baseImage}
          onTransferComplete={handleStyleTransferComplete}
        />
      )}
    </div>
  );

  // Right Panel: Comparison View
  const rightPanel = (
    <div className="h-full p-4">
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <h3 className="font-medium mb-2">Compare Iterations</h3>
          <select
            value={selectedCompareId || ''}
            onChange={(e) => setSelectedCompareId(e.target.value || null)}
            className="w-full text-sm bg-background border rounded px-3 py-1.5"
          >
            <option value="">Select iteration to compare</option>
            {iterations.map((iter, idx) => (
              <option key={iter.id} value={iter.id}>
                {iter.metadata.region || `Iteration ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>

        {currentIteration && compareIteration ? (
          <div className="flex-1">
            <CompareSlider
              original={currentIteration.imageUrl}
              restored={compareIteration.imageUrl}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
            <div>
              <SparklesIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select an iteration to compare</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full h-[calc(100vh-200px)]">
      <InpaintingLayout
        baseImage={baseImage}
        leftPanel={leftPanel}
        centerPanel={centerPanel}
        rightPanel={rightPanel}
      />
    </div>
  );
}