"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { UrlBuilder } from "@bytescale/sdk";
import { UploadWidgetConfig } from "@bytescale/upload-widget";
import { UploadDropzone } from "@bytescale/upload-widget-react";
import { useImageHistory } from "../../hooks/useImageHistory";
import { CompareSlider } from "../../components/CompareSlider";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import ResizablePanel from "../../components/ResizablePanel";
import Toggle from "../../components/Toggle";
import appendNewToName from "../../utils/appendNewToName";
import downloadPhoto from "../../utils/downloadPhoto";
import KitchenDropDown from "../../components/KitchenDropDown";
import { 
  KitchenDesignSelections,
  cabinetStyles,
  cabinetFinishes,
  countertopMaterials,
  flooringTypes,
  wallColors,
  hardwareFinishes,
  generatePromptFromSelections
} from "../../utils/kitchenTypes";
import ModernInpaintUI from "../../components/ModernInpaintUI";
import SocialShareMenu from "../../components/SocialShareMenu";
import { getCurrentUser } from "../../utils/auth";
import Toast from "../../components/Toast";

const options: UploadWidgetConfig = {
  apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY
      ? process.env.NEXT_PUBLIC_UPLOAD_API_KEY
      : "free",
  maxFileCount: 1,
  mimeTypes: ["image/jpeg", "image/png", "image/jpg"],
  maxFileSizeBytes: 5 * 1024 * 1024, // 5MB max file size
  editor: { images: { crop: false } },
  styles: {
    colors: {
      primary: "#C19A5B", // Unoform gold - Primary buttons & links
      error: "#D8594C", // Unoform red - Error messages
      shade100: "#000000", // Unoform black - Standard text
      shade200: "#FFFFFF", // White - Secondary button text
      shade300: "#FFFFFF", // White - Secondary button text (hover)
      shade400: "#4C4C4C", // Unoform gray-dark - Welcome text
      shade500: "#999999", // Unoform gray - Modal close button
      shade600: "#4C4C4C", // Unoform gray-dark - Border
      shade700: "#F2F2E5", // Unoform cream - Progress indicator background
      shade800: "#F2F2E5", // Unoform cream - File item background
      shade900: "#CCCCCC", // Unoform gray-light - Various (draggable crop buttons, etc.)
    },
    fontFamilies: {
      base: "Work Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    fontSizes: {
      base: 14,
    },
  },
};

export default function DreamPage() {
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [restoredLoaded, setRestoredLoaded] = useState<boolean>(false);
  const [sideBySide, setSideBySide] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
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
  const [generating, setGenerating] = useState<boolean>(false);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  const [showAdvancedControls, setShowAdvancedControls] = useState<boolean>(false);
  const [advancedSettings, setAdvancedSettings] = useState({
    guidance: 8,
    steps: 20,
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
    resetHistory,
  } = useImageHistory();

  const UploadDropZone = () => (
    <UploadDropzone
      options={options}
      onUpdate={({ uploadedFiles }) => {
        if (uploadedFiles.length !== 0) {
          const image = uploadedFiles[0];
          const imageName = image.originalFile.originalFileName;
          const imageUrl = UrlBuilder.url({
            accountId: image.accountId,
            filePath: image.filePath,
            options: {
              transformation: "image",
              transformationParams: {
                "w": 1344,
                "h": 768,
                "f": "jpg",
                "fit": "scale-down"
              }
            }
          });
          setPhotoName(imageName);
          setOriginalPhoto(imageUrl);
          // Add original photo to history
          addToHistory({
            url: imageUrl,
            type: 'original'
          });
          // Show notification about image processing
          const fileSize = image.originalFile.size;
          if (fileSize > 3 * 1024 * 1024) { // Over 3MB
            setToast({
              message: 'Large image uploaded. It will be automatically resized to 1344x768 pixels for optimal processing.',
              type: 'info'
            });
          } else {
            setToast({
              message: 'Image uploaded successfully! Your image will be optimized to 16:9 aspect ratio.',
              type: 'success'
            });
          }
          // Don't auto-generate - wait for user to click Generate button
        }
      }}
      width="670px"
      height="250px"
    />
  );

  async function generatePhoto(fileUrl?: string) {
    const imageToGenerate = fileUrl || originalPhoto;
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
        ...(showAdvancedControls && {
          guidance: advancedSettings.guidance,
          steps: advancedSettings.steps,
          strength: (advancedSettings.preserveAngle || advancedSettings.preserveWalls || advancedSettings.preserveFloor || 
                    advancedSettings.preserveCeiling || advancedSettings.preserveWindows) ? 
                    Math.min(0.4, advancedSettings.strength) : advancedSettings.strength
        })
      }),
    });

    if (res.status === 429) {
      setError("You've reached the daily limit of 5 requests. Please try again tomorrow.");
      setLoading(false);
      return;
    }

    if (!res.ok) {
      // For error responses, try to get the error message
      const errorText = await res.text();
      setError(errorText || `Error: ${res.status} ${res.statusText}`);
      setLoading(false);
      return;
    }

    try {
      const newPhoto = await res.json();
      const imageUrl = typeof newPhoto === 'string' ? newPhoto : newPhoto[0];
      setRestoredImage(imageUrl);
      // Add generated image to history
      addToHistory({
        url: imageUrl,
        prompt: generatePromptFromSelections(kitchenSelections),
        type: 'generated'
      });
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
      // For error responses, try to get the error message
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
      // Add inpainted image to history
      addToHistory({
        url: imageUrl,
        prompt: inpaintPrompt,
        type: 'inpainted'
      });
    } catch (error) {
      setError('Failed to process the inpainting response');
      console.error('JSON parsing error:', error);
    }
    setInpainting(false);
    setEditMode(false);
  }

  async function saveDesign() {
    if (!restoredImage || !user) return;
    
    setLoading(true);
    try {
      const currentImage = getCurrentImage();
      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({
          imageUrl: restoredImage,
          originalImageUrl: originalPhoto,
          prompt: generatePromptFromSelections(kitchenSelections),
          designSelections: kitchenSelections,
          type: currentImage?.type || 'generated'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Show success feedback
        alert("Design saved successfully!");
      } else {
        setError(data.error || "Failed to save design");
      }
    } catch (error) {
      setError("Failed to save design. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function generateVariation() {
    if (!restoredImage) {
      setError("No image to generate variations from");
      return;
    }

    setGenerating(true);
    const res = await fetch("/variation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl: restoredImage,
        prompt: generatePromptFromSelections(kitchenSelections) + 
          (showAdvancedControls && advancedSettings.wallType !== "smooth" && !advancedSettings.preserveWalls ? `, ${advancedSettings.wallType} walls` : "") +
          (showAdvancedControls && advancedSettings.ceilingType !== "flat" && !advancedSettings.preserveCeiling ? `, ${advancedSettings.ceilingType} ceiling` : "") +
          (showAdvancedControls && advancedSettings.preserveWalls ? ", keep existing walls unchanged" : "") +
          (showAdvancedControls && advancedSettings.preserveFloor ? ", keep existing floor unchanged" : "") +
          (showAdvancedControls && advancedSettings.preserveCeiling ? ", keep existing ceiling unchanged" : "") +
          (showAdvancedControls && advancedSettings.preserveWindows ? ", keep existing windows unchanged" : ""),
        ...(showAdvancedControls && {
          guidance: advancedSettings.guidance,
          steps: advancedSettings.steps,
          strength: advancedSettings.strength
        })
      }),
    });

    if (!res.ok) {
      // For error responses, try to get the error message
      const errorText = await res.text();
      setError(errorText || `Error: ${res.status} ${res.statusText}`);
      setGenerating(false);
      return;
    }

    try {
      const newPhoto = await res.json();
      const imageUrl = typeof newPhoto === 'string' ? newPhoto : newPhoto[0];
      setRestoredImage(imageUrl);
      // Add variation to history
      addToHistory({
        url: imageUrl,
        prompt: generatePromptFromSelections(kitchenSelections),
        type: 'variation'
      });
    } catch (error) {
      setError('Failed to process the variation response');
      console.error('JSON parsing error:', error);
    }
    setGenerating(false);
  }

  // Handle undo action
  const handleUndo = useCallback(() => {
    const previousImage = undo();
    if (previousImage) {
      setRestoredImage(previousImage.url);
      // Reset edit mode when undoing
      setEditMode(false);
      setError(null);
    }
  }, [undo]);

  // Handle redo action
  const handleRedo = useCallback(() => {
    const nextImage = redo();
    if (nextImage) {
      setRestoredImage(nextImage.url);
      // Reset edit mode when redoing
      setEditMode(false);
      setError(null);
    }
  }, [redo]);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setAuthChecked(true);
    };
    
    checkAuth();
  }, []);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey)) && canRedo) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canUndo, canRedo, handleUndo, handleRedo]);

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="text-neutral-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-4 sm:mb-0 mb-8 bg-background">
        <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-5">
          Generate your <span className="gradient-text">dream</span> kitchen
        </h1>
        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="flex justify-between items-center w-full flex-col mt-4">
              {!restoredImage && (
                <>
                  <div className="space-y-4 w-full max-w-2xl">
                    <div className="flex mt-3 items-center space-x-3">
                      <Image
                        src="/number-1-white.svg"
                        width={30}
                        height={30}
                        alt="1 icon"
                      />
                      <p className="text-left font-medium text-foreground">
                        Design your kitchen.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <KitchenDropDown
                        value={kitchenSelections.cabinetStyle}
                        setValue={(value) => setKitchenSelections({...kitchenSelections, cabinetStyle: value})}
                        options={cabinetStyles}
                        label="Cabinet Style"
                      />
                      <KitchenDropDown
                        value={kitchenSelections.cabinetFinish}
                        setValue={(value) => setKitchenSelections({...kitchenSelections, cabinetFinish: value})}
                        options={cabinetFinishes}
                        label="Cabinet Finish"
                      />
                      <KitchenDropDown
                        value={kitchenSelections.countertop}
                        setValue={(value) => setKitchenSelections({...kitchenSelections, countertop: value})}
                        options={countertopMaterials}
                        label="Countertop Material"
                      />
                      <KitchenDropDown
                        value={kitchenSelections.flooring}
                        setValue={(value) => setKitchenSelections({...kitchenSelections, flooring: value})}
                        options={flooringTypes}
                        label="Flooring Type"
                      />
                      <KitchenDropDown
                        value={kitchenSelections.wallColor}
                        setValue={(value) => setKitchenSelections({...kitchenSelections, wallColor: value})}
                        options={wallColors}
                        label="Wall Color"
                      />
                      <KitchenDropDown
                        value={kitchenSelections.hardware}
                        setValue={(value) => setKitchenSelections({...kitchenSelections, hardware: value})}
                        options={hardwareFinishes}
                        label="Hardware Finish"
                      />
                    </div>
                    
                    {/* Advanced Controls Toggle */}
                    <div className="mt-4">
                      <button
                        onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                        className="btn-outline btn-sm"
                      >
                        {showAdvancedControls ? 'Hide' : 'Show'} Advanced Controls
                      </button>
                    </div>
                    
                    {/* Advanced Controls Panel */}
                    {showAdvancedControls && (
                      <div className="mt-4 p-4 border border-muted rounded-lg space-y-4">
                        <h3 className="font-medium text-foreground">Advanced Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Guidance Scale ({advancedSettings.guidance})
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="20"
                              value={advancedSettings.guidance}
                              onChange={(e) => setAdvancedSettings({...advancedSettings, guidance: Number(e.target.value)})}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Steps ({advancedSettings.steps})
                            </label>
                            <input
                              type="range"
                              min="10"
                              max="50"
                              value={advancedSettings.steps}
                              onChange={(e) => setAdvancedSettings({...advancedSettings, steps: Number(e.target.value)})}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Strength ({advancedSettings.strength})
                            </label>
                            <input
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.1"
                              value={advancedSettings.strength}
                              onChange={(e) => setAdvancedSettings({...advancedSettings, strength: Number(e.target.value)})}
                              className="w-full"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="preserveAngle"
                              checked={advancedSettings.preserveAngle}
                              onChange={(e) => setAdvancedSettings({...advancedSettings, preserveAngle: e.target.checked})}
                              className="w-4 h-4"
                            />
                            <label htmlFor="preserveAngle" className="text-sm font-medium text-foreground">
                              Preserve Original Angle
                            </label>
                          </div>
                          <KitchenDropDown
                            value={advancedSettings.wallType}
                            setValue={(value) => setAdvancedSettings({...advancedSettings, wallType: value})}
                            options={["smooth", "textured", "brick", "tile", "wood paneling"]}
                            label="Wall Type"
                            disabled={advancedSettings.preserveWalls}
                          />
                          <KitchenDropDown
                            value={advancedSettings.ceilingType}
                            setValue={(value) => setAdvancedSettings({...advancedSettings, ceilingType: value})}
                            options={["flat", "coffered", "vaulted", "exposed beams", "tray"]}
                            label="Ceiling Type"
                            disabled={advancedSettings.preserveCeiling}
                          />
                        </div>
                        
                        {/* Preservation Options */}
                        <div className="border-t border-muted pt-4 mt-4">
                          <h4 className="font-medium text-foreground mb-3">Preserve Existing Elements</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="preserveWalls"
                                checked={advancedSettings.preserveWalls}
                                onChange={(e) => setAdvancedSettings({...advancedSettings, preserveWalls: e.target.checked})}
                                className="w-4 h-4"
                              />
                              <label htmlFor="preserveWalls" className="text-sm font-medium text-foreground">
                                Keep Walls
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="preserveFloor"
                                checked={advancedSettings.preserveFloor}
                                onChange={(e) => setAdvancedSettings({...advancedSettings, preserveFloor: e.target.checked})}
                                className="w-4 h-4"
                              />
                              <label htmlFor="preserveFloor" className="text-sm font-medium text-foreground">
                                Keep Floor
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="preserveCeiling"
                                checked={advancedSettings.preserveCeiling}
                                onChange={(e) => setAdvancedSettings({...advancedSettings, preserveCeiling: e.target.checked})}
                                className="w-4 h-4"
                              />
                              <label htmlFor="preserveCeiling" className="text-sm font-medium text-foreground">
                                Keep Ceiling
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="preserveWindows"
                                checked={advancedSettings.preserveWindows}
                                onChange={(e) => setAdvancedSettings({...advancedSettings, preserveWindows: e.target.checked})}
                                className="w-4 h-4"
                              />
                              <label htmlFor="preserveWindows" className="text-sm font-medium text-foreground">
                                Keep Windows
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 w-full max-w-2xl">
                    <div className="flex mt-6 w-96 items-center space-x-3">
                      <Image
                        src="/number-2-white.svg"
                        width={30}
                        height={30}
                        alt="2 icon"
                      />
                      <p className="text-left font-medium text-foreground">
                        Upload a picture of your kitchen.
                      </p>
                    </div>
                  </div>
                </>
              )}
              {restoredImage && (
                <div className="text-foreground font-medium">
                  Here's your custom-designed <b>kitchen</b> based on your selections!
                </div>
              )}
              <div
                className={`${
                  restoredLoaded ? "visible mt-6 -ml-8" : "invisible"
                }`}
              >
                <Toggle
                  className={`${restoredLoaded ? "visible mb-6" : "invisible"}`}
                  sideBySide={sideBySide}
                  setSideBySide={(newVal) => setSideBySide(newVal)}
                />
              </div>
              {restoredLoaded && sideBySide && (
                <CompareSlider
                  original={originalPhoto!}
                  restored={restoredImage!}
                />
              )}
              {!originalPhoto && (
                <>
                  <UploadDropZone />
                  <p className="text-sm text-muted-foreground mt-3 max-w-xl">
                    Accepted formats: JPEG, PNG (max 5MB). Images will be automatically resized to 16:9 aspect ratio (1344x768 pixels) for optimal results.
                  </p>
                </>
              )}
              {originalPhoto && !restoredImage && (
                <>
                  <Image
                    alt="original photo"
                    src={originalPhoto}
                    className="rounded-2xl max-w-3xl w-full"
                    width={1344}
                    height={768}
                    style={{ width: '100%', height: 'auto' }}
                  />
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => generatePhoto()}
                      disabled={loading}
                      className="btn-primary btn-lg hover-lift"
                    >
                      Generate Kitchen Design
                    </button>
                  </div>
                </>
              )}
              {restoredImage && originalPhoto && !sideBySide && (
                <div className="flex flex-col space-y-8 max-w-6xl mx-auto">
                  <div className="card overflow-hidden">
                    <div className="card-header">
                      <h2 className="card-title text-lg">Original Kitchen</h2>
                    </div>
                    <div className="card-content p-0">
                      <Image
                        alt="original kitchen photo"
                        src={originalPhoto}
                        className="w-full object-cover"
                        width={1344}
                        height={768}
                        style={{ width: '100%', height: 'auto' }}
                      />
                    </div>
                  </div>
                  <div className="card overflow-hidden">
                    <div className="card-header">
                      <h2 className="card-title text-lg">Generated Kitchen</h2>
                    </div>
                    <div className="card-content p-0">
                      <a href={restoredImage} target="_blank" rel="noreferrer" className="block hover-scale">
                        <Image
                          alt="generated kitchen"
                          src={restoredImage}
                          className="w-full object-cover cursor-zoom-in"
                          width={1344}
                          height={768}
                          style={{ width: '100%', height: 'auto' }}
                          onLoadingComplete={() => setRestoredLoaded(true)}
                        />
                      </a>
                    </div>
                  </div>
                </div>
              )}
              {editMode && restoredImage && (
                <ModernInpaintUI
                  imageUrl={restoredImage}
                  onMaskGenerated={(maskUrl, prompt) => {
                    setInpaintPrompt(prompt);
                    inpaintPhoto(maskUrl);
                  }}
                  isProcessing={inpainting}
                />
              )}
              {loading && (
                <div className="mt-8 flex flex-col items-center">
                  <div className="loading-dots text-primary">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Generating your kitchen design...</p>
                </div>
              )}
                      {inpainting && (
          <div className="mt-6">
            <div className="flex flex-col items-center">
              <div className="loading-dots text-primary">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Applying your changes...</p>
            </div>
          </div>
        )}
        
        {generating && (
          <div className="mt-6">
            <div className="flex flex-col items-center">
              <div className="loading-dots text-primary">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Generating variation...</p>
            </div>
          </div>
        )}
              {error && (
                <div
                  className="card bg-destructive/10 border-destructive/20 px-4 py-3 mt-8"
                  role="alert"
                >
                  <span className="block sm:inline">{error}</span>
                  {error.includes("daily limit") && (
                    <span className="block mt-2 text-sm text-muted-foreground">
                      Rate limiting helps us maintain service quality. Thank you for your understanding.
                    </span>
                  )}
                </div>
              )}
              <div className="flex space-x-2 justify-center">
                {originalPhoto && !loading && (
                  <button
                    onClick={() => {
                      setOriginalPhoto(null);
                      setRestoredImage(null);
                      setRestoredLoaded(false);
                      setError(null);
                      setEditMode(false);
                      resetHistory();
                    }}
                    className="btn-default btn-lg mt-8 hover-lift"
                  >
                    Generate New Kitchen
                  </button>
                )}
                {restoredLoaded && (
                  <>
                    {/* Undo/Redo buttons */}
                    <button
                      onClick={handleUndo}
                      disabled={!canUndo}
                      className={`btn-md mt-8 ${
                        canUndo 
                          ? "btn-secondary" 
                          : "btn-secondary opacity-50 cursor-not-allowed"
                      }`}
                      title="Undo (Ctrl/Cmd + Z)"
                    >
                      ← Undo
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={!canRedo}
                      className={`btn-md mt-8 ${
                        canRedo 
                          ? "btn-secondary" 
                          : "btn-secondary opacity-50 cursor-not-allowed"
                      }`}
                      title="Redo (Ctrl/Cmd + Y)"
                    >
                      Redo →
                    </button>
                    <button
                      onClick={() => {
                        downloadPhoto(
                          restoredImage!,
                          appendNewToName(photoName!)
                        );
                      }}
                      className="btn-outline btn-md mt-8 hover-lift"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>
                    <button
                      onClick={saveDesign}
                      disabled={loading || !user}
                      className="btn-secondary btn-md mt-8 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Save Design
                    </button>
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="btn-interactive btn-md mt-8 hover-lift"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      Share Design
                    </button>
                                  <button
                onClick={() => setEditMode(!editMode)}
                className={`btn-md mt-8 ${
                  editMode 
                    ? "btn-destructive" 
                    : "btn-default"
                }`}
              >
                {editMode ? "Cancel Edit" : "Edit with Inpainting"}
              </button>
              {!editMode && (
                <button
                  onClick={generateVariation}
                  disabled={generating}
                  className="btn-secondary btn-md mt-8 hover-scale"
                >
                  Generate Variation
                </button>
              )}
                  </>
                )}
              </div>
              {showShareMenu && restoredImage && (
                <SocialShareMenu
                  imageUrl={restoredImage}
                  kitchenPrompt={generatePromptFromSelections(kitchenSelections)}
                  onClose={() => setShowShareMenu(false)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </main>
      <Footer />
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
