"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useImageHistory } from "../../hooks/useImageHistory";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import WorkflowTabs from "../../components/WorkflowTabs";
import WorkflowContextBar from "../../components/navigation/WorkflowContextBar";
import { UploadTab } from "../../components/tabs/UploadTab";
import { DesignTab } from "../../components/tabs/DesignTab";
import { RefineTab } from "../../components/tabs/RefineTab";
import { CompareTab } from "../../components/tabs/CompareTab";
import { HistoryTab } from "../../components/tabs/HistoryTab";
import { ModelType } from "../../components/models/ModelSelectionTabs";
import { useWorkflowContext } from "../../hooks/useWorkflowContext";
import { 
  KitchenDesignSelections,
  generatePromptFromSelections
} from "../../utils/kitchenTypes";
import { getCurrentUser } from "../../utils/auth";
import Toast from "../../components/Toast";

// Create a client component wrapper for tabs
function TabContent({ 
  activeTab,
  ...props 
}: { 
  activeTab: string;
  [key: string]: any;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        {activeTab === "upload" && (
          <UploadTab
            originalPhoto={props.originalPhoto}
            setOriginalPhoto={props.setOriginalPhoto}
            addToHistory={props.addToHistory}
            setToast={props.setToast}
          />
        )}
        {activeTab === "design" && (
          <DesignTab
            originalPhoto={props.originalPhoto}
            restoredImage={props.restoredImage}
            kitchenSelections={props.kitchenSelections}
            setKitchenSelections={props.setKitchenSelections}
            showAdvancedControls={props.showAdvancedControls}
            setShowAdvancedControls={props.setShowAdvancedControls}
            advancedSettings={props.advancedSettings}
            setAdvancedSettings={props.setAdvancedSettings}
            generatePhoto={props.generatePhoto}
            loading={props.loading}
            error={props.error}
          />
        )}
        {activeTab === "refine" && (
          <RefineTab
            restoredImage={props.restoredImage}
            editMode={props.editMode}
            setEditMode={props.setEditMode}
            inpaintPrompt={props.inpaintPrompt}
            setInpaintPrompt={props.setInpaintPrompt}
            inpainting={props.inpainting}
            inpaintPhoto={props.inpaintPhoto}
          />
        )}
        {activeTab === "compare" && (
          <CompareTab
            originalPhoto={props.originalPhoto}
            restoredImage={props.restoredImage}
            sideBySide={props.sideBySide}
            setSideBySide={props.setSideBySide}
          />
        )}
        {activeTab === "history" && (
          <HistoryTab
            canUndo={props.canUndo}
            canRedo={props.canRedo}
            undo={props.undo}
            redo={props.redo}
            getCurrentImage={props.getCurrentImage}
            history={props.history}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function DreamPageContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "upload";
  
  const [user, setUser] = useState<any>(null);
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sideBySide, setSideBySide] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [kitchenSelections, setKitchenSelections] = useState<KitchenDesignSelections>({
    cabinetStyle: "Modern Flat-Panel",
    cabinetFinish: "Matte White",
    countertop: "White Marble",
    flooring: "Hardwood Oak",
    wallColor: "Bright White",
    hardware: "Brushed Steel"
  });
  const [inpainting, setInpainting] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [inpaintPrompt, setInpaintPrompt] = useState<string>("");
  const [showAdvancedControls, setShowAdvancedControls] = useState<boolean>(false);
  const [advancedSettings, setAdvancedSettings] = useState({
    guidance: 25, // Updated for Canny Pro
    steps: 30, // Updated for Canny Pro
    strength: 0.8,
    preserveAngle: true,
    wallType: "smooth",
    ceilingType: "flat",
    preserveWalls: false,
    preserveFloor: false,
    preserveCeiling: false,
    preserveWindows: false
  });
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);
  
  const {
    canUndo,
    canRedo,
    addToHistory,
    undo,
    redo,
    getCurrentImage,
    history,
  } = useImageHistory();
  
  const {
    workflowState,
    updateWorkflowName,
    setBaseImage,
    updateCurrentModel,
    addIteration
  } = useWorkflowContext();

  async function generatePhoto(fileUrl?: string | ModelType) {
    // Determine if the parameter is a model type or file URL
    const model = (fileUrl === 'canny-pro' || fileUrl === 'flux-pro') ? fileUrl : undefined;
    const actualFileUrl = model ? undefined : fileUrl;
    const imageToGenerate = actualFileUrl || originalPhoto;
    if (!imageToGenerate) {
      setError("Please upload an image first");
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    setLoading(true);
    const res = await fetch("/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        imageUrl: imageToGenerate, 
        prompt: generatePromptFromSelections(kitchenSelections) + 
          (showAdvancedControls && advancedSettings.wallType !== "smooth" && !advancedSettings.preserveWalls ? `, ${advancedSettings.wallType} walls` : "") +
          (showAdvancedControls && advancedSettings.ceilingType !== "flat" && !advancedSettings.preserveCeiling ? `, ${advancedSettings.ceilingType} ceiling` : "") +
          (showAdvancedControls && advancedSettings.preserveWalls ? ", keep existing walls unchanged" : "") +
          (showAdvancedControls && advancedSettings.preserveFloor ? ", keep existing floor unchanged" : "") +
          (showAdvancedControls && advancedSettings.preserveCeiling ? ", keep existing ceiling unchanged" : "") +
          (showAdvancedControls && advancedSettings.preserveWindows ? ", keep existing windows unchanged" : ""),
        ...(model && { model }), // Add model parameter if provided
        ...(showAdvancedControls && {
          guidance: advancedSettings.guidance,
          steps: advancedSettings.steps,
          strength: advancedSettings.strength
        })
      }),
    });

    if (res.status === 429) {
      setError("You've reached the daily limit of 5 requests. Please try again tomorrow.");
      setLoading(false);
      return;
    }

    if (!res.ok) {
      const errorText = await res.text();
      setError(errorText || `Error: ${res.status} ${res.statusText}`);
      setLoading(false);
      return;
    }

    try {
      const newPhoto = await res.json();
      const imageUrl = typeof newPhoto === 'string' ? newPhoto : newPhoto[0];
      setRestoredImage(imageUrl);
      addToHistory({
        url: imageUrl,
        prompt: generatePromptFromSelections(kitchenSelections),
        type: 'generated'
      });
      
      // Update workflow state if this is from a model switch
      if (model) {
        updateCurrentModel(model);
      }
      
      // Auto-switch to compare tab after generation
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'compare');
      window.history.pushState({}, '', url);
    } catch (error) {
      setError('Failed to process the response from the server');
      console.error('JSON parsing error:', error);
    }
    setTimeout(() => {
      setLoading(false);
    }, 1300);
  }

  async function inpaintPhoto(maskDataUrl: string) {
    if (!restoredImage || !inpaintPrompt) {
      setError("Please provide a prompt for inpainting");
      return;
    }

    setInpainting(true);
    const res = await fetch("/inpaint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl: restoredImage,
        maskImage: maskDataUrl,
        prompt: inpaintPrompt,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      setError(errorText || `Error: ${res.status} ${res.statusText}`);
      setInpainting(false);
      setEditMode(false);
      return;
    }

    try {
      const newPhoto = await res.json();
      const imageUrl = typeof newPhoto === 'string' ? newPhoto : newPhoto[0];
      setRestoredImage(imageUrl);
      addToHistory({
        url: imageUrl,
        prompt: inpaintPrompt,
        type: 'inpainted'
      });
      
      // Add as iteration to workflow
      addIteration({
        id: `iteration-${Date.now()}`,
        baseImage: restoredImage || originalPhoto || '',
        maskData: '', // We'd need to pass mask data from the canvas
        prompt: inpaintPrompt,
        resultImage: imageUrl,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      setError('Failed to process the inpainting response');
      console.error('JSON parsing error:', error);
    }
    setInpainting(false);
    setEditMode(false);
  }

  // Handle undo action
  const handleUndo = useCallback(() => {
    const previousImage = undo();
    if (previousImage) {
      setRestoredImage(previousImage.url);
      setEditMode(false);
      setError(null);
    }
  }, [undo]);

  // Handle redo action
  const handleRedo = useCallback(() => {
    const nextImage = redo();
    if (nextImage) {
      setRestoredImage(nextImage.url);
      setEditMode(false);
      setError(null);
    }
  }, [redo]);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    };
    
    checkAuth();
  }, []);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y' && canRedo) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canUndo, canRedo, handleUndo, handleRedo]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-white">
      <Header />
      
      {/* Workflow Context Bar */}
      <WorkflowContextBar
        workflowState={workflowState || undefined}
        onNameChange={updateWorkflowName}
      />
      
      {/* Workflow Tabs Navigation */}
      <div className="w-full max-w-6xl mx-auto px-5 mt-8 mb-8" style={{ paddingTop: workflowState ? '60px' : '0' }}>
        <WorkflowTabs />
      </div>

      {/* Tab Content Area */}
      <main className="flex flex-1 w-full flex-col items-center justify-start px-5 pb-8">
        <TabContent
          activeTab={activeTab}
          // Common props
          user={user}
          originalPhoto={originalPhoto}
          setOriginalPhoto={(photo: string | null) => {
            setOriginalPhoto(photo);
            // Update workflow state when original photo is set
            if (photo) {
              setBaseImage({ 
                id: `img-${Date.now()}`,
                url: photo, 
                prompt: '', 
                type: 'original',
                timestamp: Date.now()
              });
            }
          }}
          restoredImage={restoredImage}
          setRestoredImage={setRestoredImage}
          loading={loading}
          error={error}
          setError={setError}
          toast={toast}
          setToast={setToast}
          // Upload tab props
          addToHistory={(image: any) => {
            addToHistory(image);
            // Update workflow state when an image is uploaded
            if (image.type === 'original' && image.url) {
              setBaseImage({ 
                id: `img-${Date.now()}`,
                url: image.url, 
                prompt: '', 
                type: 'original',
                timestamp: Date.now()
              });
            }
          }}
          // Design tab props
          kitchenSelections={kitchenSelections}
          setKitchenSelections={setKitchenSelections}
          showAdvancedControls={showAdvancedControls}
          setShowAdvancedControls={setShowAdvancedControls}
          advancedSettings={advancedSettings}
          setAdvancedSettings={setAdvancedSettings}
          generatePhoto={generatePhoto}
          updateCurrentModel={updateCurrentModel}
          // Refine tab props
          editMode={editMode}
          setEditMode={setEditMode}
          inpaintPrompt={inpaintPrompt}
          setInpaintPrompt={setInpaintPrompt}
          inpainting={inpainting}
          inpaintPhoto={inpaintPhoto}
          // Compare tab props
          sideBySide={sideBySide}
          setSideBySide={setSideBySide}
          // History tab props
          canUndo={canUndo}
          canRedo={canRedo}
          undo={handleUndo}
          redo={handleRedo}
          getCurrentImage={getCurrentImage}
          history={history}
        />
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Footer />
    </div>
  );
}

// Main component with Suspense boundary
export default function DreamPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-unoform-gold mx-auto"></div>
          <p className="mt-4 text-unoform-gray">Loading...</p>
        </div>
      </div>
    }>
      <DreamPageContent />
    </Suspense>
  );
}