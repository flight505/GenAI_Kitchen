/**
 * Unoform Style Selector Component
 * Customer-friendly interface for selecting and customizing kitchen styles
 */

import React, { useState, useEffect } from 'react';
import { 
  UnoformStyle, 
  MaterialSelection,
  CustomerPreference,
  PromptBuildingContext,
  MoodSelection
} from '../../types/unoform-styles';
import { UNOFORM_STYLES } from '../../constants/unoform-styles';
import { buildUnoformPrompt } from '../../utils/unoformPromptBuilder';
import { 
  SwatchIcon, 
  SparklesIcon, 
  HomeModernIcon,
  CubeIcon,
  SunIcon,
  MoonIcon,
  CloudIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface UnoformStyleSelectorProps {
  onPromptGenerated: (prompt: string) => void;
  modelType: 'canny-pro' | 'flux-pro';
  customerPhoto?: boolean;
  onStyleChange?: (style: UnoformStyle) => void;
  onMaterialChange?: (material: string) => void;
}

export function UnoformStyleSelector({
  onPromptGenerated,
  modelType,
  customerPhoto = false,
  onStyleChange,
  onMaterialChange
}: UnoformStyleSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState<UnoformStyle>('classic');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialSelection>({
    type: 'wood',
    name: 'walnut',
    descriptor: 'rich',
    appearance: ['dark chocolate', 'swirling grain']
  });
  const [selectedMood, setSelectedMood] = useState<MoodSelection>({
    lighting: 'natural',
    atmosphere: 'minimalist'
  });
  const [showStyleGuide, setShowStyleGuide] = useState(false);
  const [prompt, setPrompt] = useState('');

  // Update prompt when selections change
  useEffect(() => {
    const context: PromptBuildingContext = {
      style: selectedStyle,
      material: selectedMaterial,
      features: getStyleFeatures(selectedStyle),
      details: getStyleDetails(selectedStyle),
      mood: selectedMood,
      modelType,
      customerPhoto
    };

    const generatedPrompt = buildUnoformPrompt(context);
    setPrompt(generatedPrompt);
    onPromptGenerated(generatedPrompt);
  }, [selectedStyle, selectedMaterial, selectedMood, modelType, customerPhoto, onPromptGenerated]);

  // Notify parent of style change
  useEffect(() => {
    onStyleChange?.(selectedStyle);
  }, [selectedStyle, onStyleChange]);

  // Get style-specific features
  function getStyleFeatures(style: UnoformStyle): string[] {
    const styleData = UNOFORM_STYLES[style];
    const features: string[] = [];
    
    // Extract primary features from validation rules
    styleData.validation.mustHave.slice(0, 3).forEach(rule => {
      features.push(rule.keywords[0]);
    });

    return features;
  }

  // Get style-specific details
  function getStyleDetails(style: UnoformStyle): string[] {
    const details: string[] = [];
    
    switch (style) {
      case 'classic':
        details.push('three-drawer modules', 'handleless design');
        break;
      case 'copenhagen':
        details.push('separate modules', 'organized interior');
        break;
      case 'shaker':
        details.push('traditional hardware', 'balanced layout');
        break;
      case 'avantgarde':
        details.push('floor-to-ceiling units', 'integrated lighting');
        break;
    }

    return details;
  }

  // Style icons mapping
  const styleIcons: Record<UnoformStyle, React.ReactNode> = {
    classic: <HomeModernIcon className="w-6 h-6" />,
    copenhagen: <CubeIcon className="w-6 h-6" />,
    shaker: <SwatchIcon className="w-6 h-6" />,
    avantgarde: <SparklesIcon className="w-6 h-6" />
  };

  return (
    <div className="space-y-6">
      {/* Style Selection */}
      <div>
        <h3 className="text-lg font-medium text-unoform-gray-dark mb-4">
          Choose Your Kitchen Style
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(UNOFORM_STYLES).map(([key, style]) => (
            <button
              key={key}
              onClick={() => setSelectedStyle(key as UnoformStyle)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${selectedStyle === key 
                  ? 'border-unoform-gold bg-unoform-cream' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`
                  ${selectedStyle === key ? 'text-unoform-gold' : 'text-gray-600'}
                `}>
                  {styleIcons[key as UnoformStyle]}
                </div>
                <h4 className="font-medium text-unoform-gray-dark">
                  {style.name}
                </h4>
                <p className="text-xs text-gray-600 text-center">
                  {style.description.split(' ').slice(0, 6).join(' ')}...
                </p>
              </div>
              {selectedStyle === key && (
                <CheckCircleIcon className="absolute top-2 right-2 w-5 h-5 text-unoform-gold" />
              )}
            </button>
          ))}
        </div>

        {/* Style Guide Button */}
        <button
          onClick={() => setShowStyleGuide(!showStyleGuide)}
          className="mt-2 text-sm text-unoform-gold hover:text-unoform-gold/80 flex items-center gap-1"
        >
          <InformationCircleIcon className="w-4 h-4" />
          {showStyleGuide ? 'Hide' : 'Show'} Style Guide
        </button>
      </div>

      {/* Style Guide */}
      {showStyleGuide && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-unoform-gray-dark mb-2">
            {UNOFORM_STYLES[selectedStyle].name} Style Guide
          </h4>
          
          <div className="space-y-3 text-sm">
            <div>
              <h5 className="font-medium text-green-700 mb-1">✓ Key Features:</h5>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {UNOFORM_STYLES[selectedStyle].validation.mustHave.slice(0, 3).map((rule, idx) => (
                  <li key={idx}>{rule.description}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-blue-700 mb-1">💡 Best For:</h5>
              <p className="text-gray-600">
                {selectedStyle === 'classic' && 'Traditional Danish homes, timeless elegance'}
                {selectedStyle === 'copenhagen' && 'Modern minimalists, open-plan living'}
                {selectedStyle === 'shaker' && 'Cozy family kitchens, American-Nordic fusion'}
                {selectedStyle === 'avantgarde' && 'Ultra-modern homes, architectural statements'}
              </p>
            </div>

            <div>
              <h5 className="font-medium text-red-700 mb-1">✗ Avoid:</h5>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {UNOFORM_STYLES[selectedStyle].validation.mustNotHave.slice(0, 2).map((rule, idx) => (
                  <li key={idx}>{rule.description}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Material Selection */}
      <div>
        <h3 className="text-lg font-medium text-unoform-gray-dark mb-4">
          Select Primary Material
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {UNOFORM_STYLES[selectedStyle].materialCompatibility.woods.length > 0 && 
            UNOFORM_STYLES[selectedStyle].materialCompatibility.woods.map(wood => (
              <MaterialButton
                key={wood}
                material={{
                  type: 'wood',
                  name: wood,
                  descriptor: getWoodDescriptor(wood),
                  appearance: getWoodAppearance(wood)
                }}
                selected={selectedMaterial.name === wood && selectedMaterial.type === 'wood'}
                onSelect={(material) => {
                  setSelectedMaterial(material);
                  onMaterialChange?.(material.name);
                }}
              />
            ))
          }
          
          {UNOFORM_STYLES[selectedStyle].materialCompatibility.paints.map(paint => (
            <MaterialButton
              key={paint}
              material={{
                type: 'paint',
                name: paint,
                descriptor: getPaintDescriptor(paint),
                appearance: []
              }}
              selected={selectedMaterial.name === paint && selectedMaterial.type === 'paint'}
              onSelect={(material) => {
                setSelectedMaterial(material);
                onMaterialChange?.(material.name);
              }}
            />
          ))}
        </div>
      </div>

      {/* Mood Selection */}
      <div>
        <h3 className="text-lg font-medium text-unoform-gray-dark mb-4">
          Set the Mood
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Lighting */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Lighting Style
            </label>
            <div className="space-y-2">
              {(['natural', 'ambient', 'dramatic', 'even'] as const).map(lighting => (
                <label key={lighting} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="lighting"
                    value={lighting}
                    checked={selectedMood.lighting === lighting}
                    onChange={(e) => setSelectedMood({
                      ...selectedMood,
                      lighting: e.target.value as MoodSelection['lighting']
                    })}
                    className="text-unoform-gold"
                  />
                  <span className="text-sm capitalize flex items-center gap-1">
                    {lighting === 'natural' && <SunIcon className="w-4 h-4" />}
                    {lighting === 'ambient' && <CloudIcon className="w-4 h-4" />}
                    {lighting === 'dramatic' && <MoonIcon className="w-4 h-4" />}
                    {lighting}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Atmosphere */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Atmosphere
            </label>
            <div className="space-y-2">
              {(['minimalist', 'warm', 'sophisticated', 'modern'] as const).map(atmosphere => (
                <label key={atmosphere} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="atmosphere"
                    value={atmosphere}
                    checked={selectedMood.atmosphere === atmosphere}
                    onChange={(e) => setSelectedMood({
                      ...selectedMood,
                      atmosphere: e.target.value as MoodSelection['atmosphere']
                    })}
                    className="text-unoform-gold"
                  />
                  <span className="text-sm capitalize">{atmosphere}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generated Prompt Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-unoform-gray-dark mb-2">
          AI Prompt Preview
        </h4>
        <p className="text-sm text-gray-600 italic">
          {prompt}
        </p>
        
        {modelType === 'canny-pro' && (
          <p className="text-xs text-blue-600 mt-2">
            <InformationCircleIcon className="w-4 h-4 inline mr-1" />
            Using Canny Pro: Your kitchen layout will be preserved
          </p>
        )}
        
        {modelType === 'flux-pro' && (
          <p className="text-xs text-green-600 mt-2">
            <SparklesIcon className="w-4 h-4 inline mr-1" />
            Using Flux Pro: Complete creative freedom for new designs
          </p>
        )}
      </div>
    </div>
  );
}

// Helper component for material buttons
function MaterialButton({ 
  material, 
  selected, 
  onSelect 
}: { 
  material: MaterialSelection; 
  selected: boolean; 
  onSelect: (material: MaterialSelection) => void;
}) {
  return (
    <button
      onClick={() => onSelect(material)}
      className={`
        p-3 rounded-lg border-2 transition-all duration-200
        ${selected 
          ? 'border-unoform-gold bg-unoform-cream' 
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium capitalize">
          {material.name}
        </span>
        {selected && <CheckCircleIcon className="w-4 h-4 text-unoform-gold" />}
      </div>
      <span className="text-xs text-gray-500">
        {material.type === 'wood' ? '🪵' : '🎨'} {material.descriptor}
      </span>
    </button>
  );
}

// Helper functions for material descriptors
function getWoodDescriptor(wood: string): string {
  const descriptors: Record<string, string> = {
    walnut: 'rich',
    oak: 'honey',
    ash: 'pale',
    'smoked oak': 'weathered',
    beech: 'warm',
    birch: 'light',
    pine: 'natural'
  };
  return descriptors[wood] || 'natural';
}

function getWoodAppearance(wood: string): string[] {
  const appearances: Record<string, string[]> = {
    walnut: ['dark chocolate', 'swirling grain'],
    oak: ['golden', 'straight grain'],
    ash: ['light blonde', 'subtle grain'],
    'smoked oak': ['grey-brown', 'muted']
  };
  return appearances[wood] || [];
}

function getPaintDescriptor(paint: string): string {
  if (paint.includes('matte')) return 'velvety';
  if (paint.includes('soft')) return 'gentle';
  if (paint.includes('sage')) return 'calming';
  if (paint.includes('charcoal')) return 'sophisticated';
  return 'smooth';
}