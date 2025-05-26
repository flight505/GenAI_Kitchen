/**
 * Enhanced Design Tab with Unoform Style System
 * Integrates intelligent prompt building and validation
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UnoformStyleSelector } from "../design/UnoformStyleSelector";
import { UnoformValidationPanel } from "../design/UnoformValidationPanel";
import { KitchenDesignSelector, KitchenDesignSelections } from "../design/KitchenDesignSelector";
import { KitchenPromptBuilder } from "../../utils/kitchenPromptBuilder";
import ModelSelectionTabs, { ModelType } from "../models/ModelSelectionTabs";
import ModelInfoCard from "../models/ModelInfoCard";
import PromptPreview from "../prompt/PromptPreview";
import DynamicParameters from "../parameters/DynamicParameters";
import { 
  InformationCircleIcon,
  CheckBadgeIcon,
  SparklesIcon,
  PhotoIcon,
  PaintBrushIcon
} from "@heroicons/react/24/outline";
import { UnoformStyle, ValidationResult } from "../../types/unoform-styles";

interface DesignTabV2Props {
  originalPhoto: string | null;
  restoredImage: string | null;
  showAdvancedControls: boolean;
  setShowAdvancedControls: (show: boolean) => void;
  advancedSettings: any;
  setAdvancedSettings: (settings: any) => void;
  generatePhoto: (model?: ModelType, customPrompt?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  updateCurrentModel?: (model: ModelType) => void;
}

export function DesignTabV2({
  originalPhoto,
  restoredImage,
  showAdvancedControls,
  setShowAdvancedControls,
  advancedSettings,
  setAdvancedSettings,
  generatePhoto,
  loading,
  error,
  updateCurrentModel,
}: DesignTabV2Props) {
  const [selectedModel, setSelectedModel] = useState<ModelType>('canny-pro');
  const [showModelInfo, setShowModelInfo] = useState<ModelType | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [editedPrompt, setEditedPrompt] = useState<string>("");
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<UnoformStyle>('classic');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [activeView, setActiveView] = useState<'design' | 'validation'>('design');
  const [designMode, setDesignMode] = useState<'simple' | 'advanced'>('simple');
  
  // Track selections for metadata
  const [materialSelection, setMaterialSelection] = useState<string>('');
  const [worktopSelection, setWorktopSelection] = useState<string>('');
  const [hardwareSelection, setHardwareSelection] = useState<string>('');
  
  // Comprehensive kitchen design selections
  const [kitchenSelections, setKitchenSelections] = useState<KitchenDesignSelections | null>(null);

  // Update edited prompt when generated prompt changes
  useEffect(() => {
    if (!isEditingPrompt) {
      setEditedPrompt(generatedPrompt);
    }
  }, [generatedPrompt, isEditingPrompt]);

  // Handle prompt generation from style selector
  const handlePromptGenerated = (prompt: string) => {
    setGeneratedPrompt(prompt);
    if (!isEditingPrompt) {
      setEditedPrompt(prompt);
    }
  };

  // Handle kitchen design selections change
  const handleKitchenSelectionsChange = (selections: KitchenDesignSelections) => {
    setKitchenSelections(selections);
    
    // Generate prompt from selections
    const promptBuilder = new KitchenPromptBuilder(selections);
    const prompt = promptBuilder.generatePrompt();
    const metadata = promptBuilder.getMetadata();
    
    setGeneratedPrompt(prompt);
    if (!isEditingPrompt) {
      setEditedPrompt(prompt);
    }
    
    // Update metadata for simple mode tracking
    setSelectedStyle(selections.cabinetStyle.toLowerCase() as UnoformStyle);
    setMaterialSelection(metadata.material);
    setWorktopSelection(metadata.worktop);
    setHardwareSelection(metadata.hardware);
  };

  // Handle generate button click
  const handleGenerate = async () => {
    const promptToUse = isEditingPrompt ? editedPrompt : generatedPrompt;
    await generatePhoto(selectedModel, promptToUse);
    
    // Show validation panel after generation
    if (restoredImage) {
      setShowValidation(true);
      setActiveView('validation');
    }
  };

  // Handle validation complete
  const handleValidationComplete = (result: ValidationResult) => {
    setValidationResult(result);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-work font-medium text-unoform-gray-dark">
            Design Your Kitchen
          </h2>
          <p className="text-unoform-gray mt-1">
            {activeView === 'design' 
              ? 'Select your style and customize your kitchen design'
              : 'Validate your generated design against Unoform standards'
            }
          </p>
        </div>
        
        {restoredImage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('design')}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeView === 'design' 
                  ? 'bg-unoform-gold text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <SparklesIcon className="w-4 h-4 inline mr-1" />
              Design
            </button>
            <button
              onClick={() => setActiveView('validation')}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1
                ${activeView === 'validation' 
                  ? 'bg-unoform-gold text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <CheckBadgeIcon className="w-4 h-4" />
              Validate
              {validationResult && (
                <span className={`
                  ml-1 px-1.5 py-0.5 text-xs rounded-full
                  ${validationResult.score >= 80 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                  }
                `}>
                  {validationResult.score}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Controls (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {activeView === 'design' ? (
            <>
              {/* Model Selection */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-unoform-gray-dark">
                    AI Model Selection
                  </h3>
                  <button
                    onClick={() => setShowModelInfo(selectedModel)}
                    className="text-sm text-unoform-gold hover:text-unoform-gold/80 flex items-center gap-1"
                  >
                    <InformationCircleIcon className="w-4 h-4" />
                    Learn More
                  </button>
                </div>
                
                <ModelSelectionTabs
                  selectedModel={selectedModel}
                  onModelSelect={(model) => {
                    setSelectedModel(model);
                    updateCurrentModel?.(model);
                  }}
                  disabled={loading}
                />
                
                {originalPhoto && selectedModel === 'canny-pro' && (
                  <p className="mt-3 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    <InformationCircleIcon className="w-4 h-4 inline mr-1" />
                    Your kitchen layout will be preserved while updating the style
                  </p>
                )}
              </div>

              {/* Design Mode Toggle */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-unoform-gray-dark">
                    Kitchen Design Configuration
                  </h3>
                  <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setDesignMode('simple')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        designMode === 'simple'
                          ? 'bg-white text-unoform-gray-dark shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Simple
                    </button>
                    <button
                      onClick={() => setDesignMode('advanced')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                        designMode === 'advanced'
                          ? 'bg-white text-unoform-gray-dark shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <PaintBrushIcon className="w-4 h-4" />
                      Advanced
                    </button>
                  </div>
                </div>
                
                {designMode === 'simple' ? (
                  <UnoformStyleSelector
                    onPromptGenerated={handlePromptGenerated}
                    modelType={selectedModel}
                    customerPhoto={!!originalPhoto}
                    onStyleChange={setSelectedStyle}
                    onMaterialChange={setMaterialSelection}
                  />
                ) : (
                  <KitchenDesignSelector
                    onSelectionsChange={handleKitchenSelectionsChange}
                    initialSelections={kitchenSelections || undefined}
                  />
                )}
              </div>

              {/* Advanced Parameters */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-unoform-gray-dark">
                    Advanced Settings
                  </h3>
                  <button
                    onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${showAdvancedControls ? 'bg-unoform-gold' : 'bg-gray-200'}
                    `}
                  >
                    <span className="sr-only">Toggle advanced settings</span>
                    <span className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${showAdvancedControls ? 'translate-x-6' : 'translate-x-1'}
                    `} />
                  </button>
                </div>
                
                {showAdvancedControls && (
                  <DynamicParameters
                    modelType={selectedModel}
                    values={advancedSettings}
                    onChange={setAdvancedSettings}
                    showAdvanced={true}
                  />
                )}
              </div>

              {/* Prompt Preview */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <PromptPreview
                  prompt={editedPrompt || generatedPrompt}
                  onPromptChange={(newPrompt) => {
                    setEditedPrompt(newPrompt);
                    setIsEditingPrompt(true);
                  }}
                  metadata={
                    designMode === 'advanced' && kitchenSelections
                      ? {
                          style: kitchenSelections.cabinetStyle,
                          material: kitchenSelections.cabinetMaterial === 'Painted' 
                            ? `${kitchenSelections.cabinetColor} ${kitchenSelections.cabinetMaterial}`
                            : kitchenSelections.cabinetMaterial,
                          worktop: `${kitchenSelections.worktopMaterial} (${kitchenSelections.worktopFinish})`,
                          hardware: kitchenSelections.hardware,
                          backsplash: kitchenSelections.backsplashType !== 'None'
                            ? `${kitchenSelections.backsplashType} - ${kitchenSelections.backsplashMaterial}`
                            : undefined,
                          appliances: kitchenSelections.applianceStrategy
                        }
                      : {
                          style: selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1),
                          material: materialSelection || undefined,
                          worktop: worktopSelection || undefined,
                          hardware: hardwareSelection || undefined
                        }
                  }
                  className="mb-0"
                />
                
                {isEditingPrompt && (
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-amber-600">
                      <InformationCircleIcon className="w-4 h-4 inline mr-1" />
                      You've edited the prompt manually
                    </p>
                    <button
                      onClick={() => {
                        setEditedPrompt(generatedPrompt);
                        setIsEditingPrompt(false);
                      }}
                      className="text-sm text-unoform-gold hover:text-unoform-gold/80"
                    >
                      Reset to original
                    </button>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !originalPhoto}
                className={`w-full btn-default py-3 text-base font-medium ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating Your Design...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5 inline mr-2" />
                    Generate Kitchen Design
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </>
          ) : (
            /* Validation View */
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <UnoformValidationPanel
                style={selectedStyle}
                imageUrl={restoredImage || undefined}
                onValidationComplete={handleValidationComplete}
                showInlineGuide={true}
              />
              
              {validationResult && validationResult.score >= 80 && (
                <div className="mt-6">
                  <button
                    onClick={() => setActiveView('design')}
                    className="w-full btn-default"
                  >
                    Create Another Design
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Image Preview (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-medium text-unoform-gray-dark mb-3">
                {restoredImage ? 'Generated Design' : 'Original Photo'}
              </h3>
              
              {(originalPhoto || restoredImage) ? (
                <div className="rounded-lg overflow-hidden">
                  <Image
                    alt={restoredImage ? "Generated kitchen design" : "Original kitchen photo"}
                    src={restoredImage || originalPhoto || ''}
                    className="w-full"
                    width={672}
                    height={384}
                  />
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
                    Upload a photo in the Upload tab to get started
                  </p>
                </div>
              )}
              
              {restoredImage && validationResult && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Style Score:
                    </span>
                    <span className={`
                      text-lg font-bold
                      ${validationResult.score >= 80 ? 'text-green-600' : 'text-yellow-600'}
                    `}>
                      {validationResult.score}/100
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Style Reference Card */}
            {selectedStyle && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Style
                </h4>
                <p className="text-xs text-gray-600">
                  {selectedStyle === 'classic' && 'Horizontal slats with thick frames'}
                  {selectedStyle === 'copenhagen' && 'Exposed drawer boxes, minimal aesthetic'}
                  {selectedStyle === 'shaker' && 'Frame-and-panel doors, traditional charm'}
                  {selectedStyle === 'avantgarde' && 'Seamless surfaces, architectural grid'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Model Info Modal */}
      {showModelInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ModelInfoCard
              modelType={showModelInfo}
              onClose={() => setShowModelInfo(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}