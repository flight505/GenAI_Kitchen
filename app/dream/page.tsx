"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { UrlBuilder } from "@bytescale/sdk";
import { UploadWidgetConfig } from "@bytescale/upload-widget";
import { UploadDropzone } from "@bytescale/upload-widget-react";
import { useImageHistory } from "../../hooks/useImageHistory";
import { CompareSlider } from "../../components/CompareSlider";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import LoadingDots from "../../components/LoadingDots";
import ResizablePanel from "../../components/ResizablePanel";
import Toggle from "../../components/Toggle";
import appendNewToName from "../../utils/appendNewToName";
import downloadPhoto from "../../utils/downloadPhoto";
import KitchenDropDown from "../../components/KitchenDropDown";
import { 
  KitchenDesignSelections,
  CabinetStyle,
  CabinetFinish,
  CountertopMaterial,
  FlooringType,
  WallColor,
  HardwareFinish,
  cabinetStyles,
  cabinetFinishes,
  countertopMaterials,
  flooringTypes,
  wallColors,
  hardwareFinishes,
  generatePromptFromSelections
} from "../../utils/kitchenTypes";
import MaskDrawingCanvas from "../../components/MaskDrawingCanvas";

const options: UploadWidgetConfig = {
  apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY
      ? process.env.NEXT_PUBLIC_UPLOAD_API_KEY
      : "free",
  maxFileCount: 1,
  mimeTypes: ["image/jpeg", "image/png", "image/jpg"],
  editor: { images: { crop: false } },
  styles: {
    colors: {
      primary: "#2563EB", // Primary buttons & links
      error: "#d23f4d", // Error messages
      shade100: "#fff", // Standard text
      shade200: "#fffe", // Secondary button text
      shade300: "#fffd", // Secondary button text (hover)
      shade400: "#fffc", // Welcome text
      shade500: "#fff9", // Modal close button
      shade600: "#fff7", // Border
      shade700: "#fff2", // Progress indicator background
      shade800: "#fff1", // File item background
      shade900: "#ffff", // Various (draggable crop buttons, etc.)
    },
  },
};

export default function DreamPage() {
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
  
  const {
    history,
    currentIndex,
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
              transformation: "preset",
              transformationPreset: "thumbnail"
            }
          });
          setPhotoName(imageName);
          setOriginalPhoto(imageUrl);
          // Add original photo to history
          addToHistory({
            url: imageUrl,
            type: 'original'
          });
          generatePhoto(imageUrl);
        }
      }}
      width="670px"
      height="250px"
    />
  );

  async function generatePhoto(fileUrl: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    setLoading(true);
    const res = await fetch("/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        imageUrl: fileUrl, 
        prompt: generatePromptFromSelections(kitchenSelections)
      }),
    });

    let newPhoto = await res.json();
    if (res.status !== 200) {
      setError(newPhoto);
    } else {
      const imageUrl = typeof newPhoto === 'string' ? newPhoto : newPhoto[0];
      setRestoredImage(imageUrl);
      // Add generated image to history
      addToHistory({
        url: imageUrl,
        prompt: generatePromptFromSelections(kitchenSelections),
        type: 'generated'
      });
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

    let newPhoto = await res.json();
    if (res.status !== 200) {
      setError(newPhoto);
    } else {
      const imageUrl = typeof newPhoto === 'string' ? newPhoto : newPhoto[0];
      setRestoredImage(imageUrl);
      // Add inpainted image to history
      addToHistory({
        url: imageUrl,
        prompt: inpaintPrompt,
        type: 'inpainted'
      });
    }
    setInpainting(false);
    setEditMode(false);
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
        prompt: generatePromptFromSelections(kitchenSelections),
      }),
    });

    let newPhoto = await res.json();
    if (res.status !== 200) {
      setError(newPhoto);
    } else {
      const imageUrl = typeof newPhoto === 'string' ? newPhoto : newPhoto[0];
      setRestoredImage(imageUrl);
      // Add variation to history
      addToHistory({
        url: imageUrl,
        prompt: generatePromptFromSelections(kitchenSelections),
        type: 'variation'
      });
    }
    setGenerating(false);
  }

  // Handle undo action
  const handleUndo = () => {
    const previousImage = undo();
    if (previousImage) {
      setRestoredImage(previousImage.url);
      // Reset edit mode when undoing
      setEditMode(false);
      setError(null);
    }
  };

  // Handle redo action
  const handleRedo = () => {
    const nextImage = redo();
    if (nextImage) {
      setRestoredImage(nextImage.url);
      // Reset edit mode when redoing
      setEditMode(false);
      setError(null);
    }
  };

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
  }, [canUndo, canRedo]);

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-4 sm:mb-0 mb-8">
        <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-slate-100 sm:text-6xl mb-5">
          Generate your <span className="text-blue-600">dream</span> kitchen
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
                      <p className="text-left font-medium">
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
                  </div>
                  <div className="mt-4 w-full max-w-2xl">
                    <div className="flex mt-6 w-96 items-center space-x-3">
                      <Image
                        src="/number-2-white.svg"
                        width={30}
                        height={30}
                        alt="2 icon"
                      />
                      <p className="text-left font-medium">
                        Upload a picture of your kitchen.
                      </p>
                    </div>
                  </div>
                </>
              )}
              {restoredImage && (
                <div>
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
              {!originalPhoto && <UploadDropZone />}
              {originalPhoto && !restoredImage && (
                <Image
                  alt="original photo"
                  src={originalPhoto}
                  className="rounded-2xl h-96"
                  width={475}
                  height={475}
                />
              )}
              {restoredImage && originalPhoto && !sideBySide && (
                <div className="flex sm:space-x-4 sm:flex-row flex-col">
                  <div>
                    <h2 className="mb-1 font-medium text-lg">Original Kitchen</h2>
                    <Image
                      alt="original kitchen photo"
                      src={originalPhoto}
                      className="rounded-2xl relative w-full h-96"
                      width={475}
                      height={475}
                    />
                  </div>
                  <div className="sm:mt-0 mt-8">
                    <h2 className="mb-1 font-medium text-lg">Generated Kitchen</h2>
                    <a href={restoredImage} target="_blank" rel="noreferrer">
                      <Image
                        alt="generated kitchen"
                        src={restoredImage}
                        className="rounded-2xl relative sm:mt-0 mt-2 cursor-zoom-in w-full h-96"
                        width={475}
                        height={475}
                        onLoadingComplete={() => setRestoredLoaded(true)}
                      />
                    </a>
                    {editMode && (
                      <div className="mt-4">
                        <input
                          type="text"
                          placeholder="Describe what to change (e.g., 'make the cabinets white')"
                          value={inpaintPrompt}
                          onChange={(e) => setInpaintPrompt(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <MaskDrawingCanvas
                          imageUrl={restoredImage}
                          onMaskGenerated={inpaintPhoto}
                          width={475}
                          height={475}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {loading && (
                <button
                  disabled
                  className="bg-blue-500 rounded-full text-white font-medium px-4 pt-2 pb-3 mt-8 w-40"
                >
                  <span className="pt-4">
                    <LoadingDots color="white" style="large" />
                  </span>
                </button>
              )}
                      {inpainting && (
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-2">Applying your changes...</p>
            <button
              disabled
              className="bg-blue-500 rounded-full text-white font-medium px-4 pt-2 pb-3 w-40"
            >
              <span className="pt-4">
                <LoadingDots color="white" style="large" />
              </span>
            </button>
          </div>
        )}
        
        {generating && (
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-2">Generating variation...</p>
            <button
              disabled
              className="bg-blue-500 rounded-full text-white font-medium px-4 pt-2 pb-3 w-40"
            >
              <span className="pt-4">
                <LoadingDots color="white" style="large" />
              </span>
            </button>
          </div>
        )}
              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mt-8"
                  role="alert"
                >
                  <span className="block sm:inline">{error}</span>
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
                    className="bg-blue-500 rounded-full text-white font-medium px-4 py-2 mt-8 hover:bg-blue-500/80 transition"
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
                      className={`rounded-full font-medium px-4 py-2 mt-8 transition ${
                        canUndo 
                          ? "bg-gray-600 text-white hover:bg-gray-700" 
                          : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      }`}
                      title="Undo (Ctrl/Cmd + Z)"
                    >
                      ← Undo
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={!canRedo}
                      className={`rounded-full font-medium px-4 py-2 mt-8 transition ${
                        canRedo 
                          ? "bg-gray-600 text-white hover:bg-gray-700" 
                          : "bg-gray-400 text-gray-200 cursor-not-allowed"
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
                      className="bg-white rounded-full text-black border font-medium px-4 py-2 mt-8 hover:bg-gray-100 transition"
                    >
                      Download Generated Kitchen
                    </button>
                                  <button
                onClick={() => setEditMode(!editMode)}
                className={`rounded-full font-medium px-4 py-2 mt-8 transition ${
                  editMode 
                    ? "bg-red-500 text-white hover:bg-red-600" 
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {editMode ? "Cancel Edit" : "Edit with Inpainting"}
              </button>
              {!editMode && (
                <button
                  onClick={generateVariation}
                  disabled={generating}
                  className="bg-purple-500 rounded-full text-white font-medium px-4 py-2 mt-8 hover:bg-purple-600 transition"
                >
                  Generate Variation
                </button>
              )}
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </main>
      <Footer />
    </div>
  );
}
