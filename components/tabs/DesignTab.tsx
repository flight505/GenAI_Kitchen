"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import KitchenDropDown from "../KitchenDropDown";
import ModelSelectionTabs, { ModelType } from "../models/ModelSelectionTabs";
import ModelInfoCard from "../models/ModelInfoCard";
import ModelComparisonTable from "../models/ModelComparisonTable";
import PromptPreview from "../prompt/PromptPreview";
import DynamicParameters from "../parameters/DynamicParameters";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
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

interface DesignTabProps {
  originalPhoto: string | null;
  restoredImage: string | null;
  kitchenSelections: KitchenDesignSelections;
  setKitchenSelections: (selections: KitchenDesignSelections) => void;
  showAdvancedControls: boolean;
  setShowAdvancedControls: (show: boolean) => void;
  advancedSettings: any;
  setAdvancedSettings: (settings: any) => void;
  generatePhoto: (model?: ModelType) => Promise<void>;
  loading: boolean;
  error: string | null;
  updateCurrentModel?: (model: ModelType) => void;
}

export function DesignTab({
  originalPhoto,
  restoredImage,
  kitchenSelections,
  setKitchenSelections,
  showAdvancedControls,
  setShowAdvancedControls,
  advancedSettings,
  setAdvancedSettings,
  generatePhoto,
  loading,
  error,
  updateCurrentModel,
}: DesignTabProps) {
  const [promptPreview, setPromptPreview] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<ModelType>('canny-pro');
  const [showModelInfo, setShowModelInfo] = useState<ModelType | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Update prompt preview when selections change
  useEffect(() => {
    const basePrompt = generatePromptFromSelections(kitchenSelections);
    const advancedPrompt = showAdvancedControls ? 
      (advancedSettings.wallType !== "smooth" && !advancedSettings.preserveWalls ? `, ${advancedSettings.wallType} walls` : "") +
      (advancedSettings.ceilingType !== "flat" && !advancedSettings.preserveCeiling ? `, ${advancedSettings.ceilingType} ceiling` : "") +
      (advancedSettings.preserveWalls ? ", keep existing walls unchanged" : "") +
      (advancedSettings.preserveFloor ? ", keep existing floor unchanged" : "") +
      (advancedSettings.preserveCeiling ? ", keep existing ceiling unchanged" : "") +
      (advancedSettings.preserveWindows ? ", keep existing windows unchanged" : "")
      : "";
    setPromptPreview(basePrompt + advancedPrompt);
  }, [kitchenSelections, showAdvancedControls, advancedSettings]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Design Controls */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-work font-medium text-unoform-gray-dark mb-2">
              Design Your Kitchen
            </h2>
            <p className="text-unoform-gray mb-6">
              Choose your generation mode and customize materials and finishes below.
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-medium text-unoform-gray-dark">AI Model Selection</h3>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="text-sm text-unoform-gold hover:text-unoform-gold/80 font-medium flex items-center gap-1"
              >
                <InformationCircleIcon className="w-4 h-4" />
                {showComparison ? 'Hide' : 'Compare'} Models
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
            
            {/* Model Info Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowModelInfo(selectedModel)}
                className="text-sm text-unoform-gray hover:text-unoform-gold flex items-center gap-1"
              >
                <InformationCircleIcon className="w-4 h-4" />
                Learn more about {selectedModel === 'canny-pro' ? 'FLUX Canny Pro' : 'FLUX 1.1 Pro'}
              </button>
            </div>
            
            {/* Model Comparison Table */}
            {showComparison && (
              <div className="mt-4">
                <ModelComparisonTable />
              </div>
            )}
          </div>

          {/* Design Selections */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <KitchenDropDown
                label="Cabinet Style"
                options={cabinetStyles}
                value={kitchenSelections.cabinetStyle}
                setValue={(value) => {
                  setKitchenSelections({ ...kitchenSelections, cabinetStyle: value });
                }}
              />
              <KitchenDropDown
                label="Cabinet Finish"
                options={cabinetFinishes}
                value={kitchenSelections.cabinetFinish}
                setValue={(value) => {
                  setKitchenSelections({ ...kitchenSelections, cabinetFinish: value });
                }}
              />
              <KitchenDropDown
                label="Countertop"
                options={countertopMaterials}
                value={kitchenSelections.countertop}
                setValue={(value) => {
                  setKitchenSelections({ ...kitchenSelections, countertop: value });
                }}
              />
              <KitchenDropDown
                label="Flooring"
                options={flooringTypes}
                value={kitchenSelections.flooring}
                setValue={(value) => {
                  setKitchenSelections({ ...kitchenSelections, flooring: value });
                }}
              />
              <KitchenDropDown
                label="Wall Color"
                options={wallColors}
                value={kitchenSelections.wallColor}
                setValue={(value) => {
                  setKitchenSelections({ ...kitchenSelections, wallColor: value });
                }}
                disabled={showAdvancedControls && advancedSettings.preserveWalls}
              />
              <KitchenDropDown
                label="Hardware Finish"
                options={hardwareFinishes}
                value={kitchenSelections.hardware}
                setValue={(value) => {
                  setKitchenSelections({ ...kitchenSelections, hardware: value });
                }}
              />
            </div>
          </div>

          {/* Advanced Controls Toggle */}
          <div className="border-t border-unoform-gray-light pt-4">
            <div className="flex items-center justify-between">
              <label htmlFor="advanced-controls" className="text-sm font-medium text-unoform-gray-dark">
                Show Advanced Controls
              </label>
              <button
                id="advanced-controls"
                type="button"
                onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                  ${showAdvancedControls ? 'bg-unoform-gold' : 'bg-gray-200'}
                `}
                role="switch"
                aria-checked={showAdvancedControls}
              >
                <span className="sr-only">Show advanced controls</span>
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                    ${showAdvancedControls ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* Dynamic Parameters */}
          <div className="border-t border-gray-200 pt-4">
            <DynamicParameters
              modelType={selectedModel}
              values={advancedSettings}
              onChange={setAdvancedSettings}
              showAdvanced={showAdvancedControls}
            />
          </div>
          
          {/* Legacy Advanced Controls - Preservation Options */}
          {showAdvancedControls && (
            <div className="space-y-4 p-4 bg-unoform-cream rounded-lg">
              <h3 className="font-work font-medium text-unoform-gray-dark">Kitchen-Specific Settings</h3>
              
              {/* Preservation Options */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-unoform-gray">Preserve Existing Elements</h4>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={advancedSettings.preserveWalls}
                      onChange={(e) => {
                        setAdvancedSettings({ ...advancedSettings, preserveWalls: e.target.checked });
                      }}
                      className="rounded border-unoform-gray-dark"
                    />
                    <span className="text-sm">Walls</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={advancedSettings.preserveFloor}
                      onChange={(e) => {
                        setAdvancedSettings({ ...advancedSettings, preserveFloor: e.target.checked });
                      }}
                      className="rounded border-unoform-gray-dark"
                    />
                    <span className="text-sm">Floor</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={advancedSettings.preserveCeiling}
                      onChange={(e) => {
                        setAdvancedSettings({ ...advancedSettings, preserveCeiling: e.target.checked });
                      }}
                      className="rounded border-unoform-gray-dark"
                    />
                    <span className="text-sm">Ceiling</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={advancedSettings.preserveWindows}
                      onChange={(e) => {
                        setAdvancedSettings({ ...advancedSettings, preserveWindows: e.target.checked });
                      }}
                      className="rounded border-unoform-gray-dark"
                    />
                    <span className="text-sm">Windows</span>
                  </label>
                </div>
              </div>

              {/* Note: Main parameters are now in DynamicParameters component above */}
            </div>
          )}

          {/* Prompt Preview */}
          {promptPreview && (
            <PromptPreview
              prompt={promptPreview}
              onPromptChange={setPromptPreview}
              className="mb-4"
            />
          )}

          {/* Generate Button */}
          <button
            onClick={() => generatePhoto(selectedModel)}
            disabled={loading || !originalPhoto}
            className={`w-full btn-default ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Generating...' : 'Generate Kitchen Design'}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Right Column - Image Preview */}
        <div className="space-y-4">
          <div className="sticky top-4">
            <h3 className="text-lg font-work font-medium text-unoform-gray-dark mb-4">
              {restoredImage ? 'Generated Design' : 'Original Photo'}
            </h3>
            {(originalPhoto || restoredImage) && (
              <div className="rounded-lg overflow-hidden border border-unoform-gray-dark">
                <Image
                  alt={restoredImage ? "Generated kitchen design" : "Original kitchen photo"}
                  src={restoredImage || originalPhoto || ''}
                  className="w-full"
                  width={1344}
                  height={768}
                />
              </div>
            )}
            {!originalPhoto && (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-unoform-gray">Please upload a photo first</p>
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