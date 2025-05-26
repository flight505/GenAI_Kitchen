/**
 * Comprehensive Kitchen Design Selector
 * Supports cabinet styles, materials, worktops, backsplashes, appliances, and more
 */

"use client";

import { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export interface KitchenDesignSelections {
  // Unoform Cabinet Styles
  cabinetStyle: 'Classic' | 'Copenhagen' | 'Shaker' | 'Avantgarde';
  
  // Cabinet Material/Finish
  cabinetMaterial: 
    | 'White Oak' | 'Walnut' | 'Ash' | 'Smoked Oak' | 'Black Oak' | 'Painted';
  
  // Paint colors (if painted)
  cabinetColor?: 
    | 'Glacier White' | 'Cream White' | 'Sage Green' | 'Kieselgrau'
    | 'Steingrau' | 'Olive' | 'Charcoal' | 'Matte Black';
  
  // Hardware
  hardware: 
    | 'None (Handleless)' | 'Brass Knobs' | 'Black Metal Handles'
    | 'Steel Bar Pulls' | 'Integrated Grip';
  
  // Worktop Material
  worktopMaterial:
    | 'Belvedere Quartzite' | 'Taj Mahal Quartzite' | 'Mont Blanc Quartzite'
    | 'Fusion Quartzite' | 'Sea Pearl Quartzite' | 'Calacatta Marble'
    | 'Absolute Black Granite' | 'Black Pearl Granite' | 'Kashmir White Granite'
    | 'Solid Oak' | 'Solid Walnut' | 'Concrete' | 'White Composite';
  
  // Worktop Details
  worktopFinish: 'Polished' | 'Honed' | 'Leathered' | 'Oiled';
  worktopEdge: 'Straight' | 'Eased' | 'Bullnose' | 'Waterfall';
  worktopThickness: 'Slim' | 'Standard' | 'Chunky';
  
  // Backsplash Configuration
  backsplashType: 
    | 'None' | 'Standard Height' | 'Full Height' | 'Window Surround' | 'Ledge Only';
  
  backsplashMaterial:
    | 'Match Worktop' | 'Contrasting Stone' | 'Subway Tile'
    | 'Large Format Tile' | 'Glass' | 'Metal';
  
  backsplashPattern?:
    | 'Standard' | 'Bookmatched' | 'Herringbone' | 'Vertical Stack';
  
  // Appliance Handling
  applianceStrategy:
    | 'Keep All Existing' | 'Update to Integrated' | 'Update to Professional'
    | 'Remove Upper Appliances' | 'Minimal Visible';
  
  applianceFinish:
    | 'Stainless Steel' | 'Black Stainless' | 'Matte Black'
    | 'Integrated Panels' | 'White';
  
  // Kitchen Layout Elements
  layoutElements: {
    island: boolean;
    peninsula: boolean;
    openShelving: boolean;
    upperCabinets: boolean;
    tallCabinets: boolean;
    windowAboveSink: boolean;
  };
  
  // Flooring (affects overall look)
  flooring: 
    | 'Light Wood' | 'Dark Wood' | 'Herringbone Wood'
    | 'Large Tiles' | 'Concrete' | 'Natural Stone';
  
  // Wall Treatment
  wallColor:
    | 'Bright White' | 'Warm White' | 'Light Grey'
    | 'Beige' | 'Sage' | 'Charcoal';
  
  // Lighting Style
  lightingStyle:
    | 'Minimal Recessed' | 'Statement Pendants' | 'Under Cabinet LED'
    | 'Track Lighting' | 'Natural Light Focus';
}

// Material Visual Descriptions
const MATERIAL_DESCRIPTIONS: Record<string, Record<string, string>> = {
  worktop: {
    'Belvedere Quartzite': 'white surface with dramatic grey veining flowing like smoke',
    'Taj Mahal Quartzite': 'warm beige stone with subtle golden undertones and gentle movement',
    'Mont Blanc Quartzite': 'pure white with delicate thin grey lines',
    'Fusion Quartzite': 'dramatic black base with bold white lightning strikes',
    'Sea Pearl Quartzite': 'grey-green with pearlescent shimmer and oceanic waves',
    'Calacatta Marble': 'white marble with bold grey and gold veining',
    'Absolute Black Granite': 'pure jet black with no pattern',
    'Black Pearl Granite': 'black with silver flecks that sparkle',
    'Kashmir White Granite': 'cream base with burgundy and grey speckles',
    'Solid Oak': 'golden honey wood with visible grain',
    'Solid Walnut': 'rich chocolate brown wood with natural patterns',
    'Concrete': 'industrial grey with subtle texture',
    'White Composite': 'pure white engineered surface'
  },
  
  finishes: {
    'Polished': 'mirror-like reflective shine',
    'Honed': 'smooth matte finish without shine',
    'Leathered': 'textured surface with natural feel',
    'Oiled': 'natural wood finish enhancing grain'
  },
  
  edges: {
    'Straight': 'clean sharp modern edge',
    'Eased': 'slightly softened edge corners',
    'Bullnose': 'fully rounded soft edge',
    'Waterfall': 'dramatic continuation to floor'
  }
};

// Preset combinations
const PRESET_COMBINATIONS = {
  'Modern Minimalist': {
    cabinetStyle: 'Avantgarde',
    cabinetMaterial: 'Painted',
    cabinetColor: 'Matte Black',
    worktopMaterial: 'Calacatta Marble',
    worktopFinish: 'Polished',
    backsplashType: 'Full Height',
    applianceStrategy: 'Update to Integrated'
  },
  'Scandinavian Warm': {
    cabinetStyle: 'Classic',
    cabinetMaterial: 'White Oak',
    worktopMaterial: 'Taj Mahal Quartzite',
    worktopFinish: 'Honed',
    backsplashType: 'Standard Height',
    applianceStrategy: 'Keep All Existing'
  },
  'Traditional Elegance': {
    cabinetStyle: 'Shaker',
    cabinetMaterial: 'Painted',
    cabinetColor: 'Sage Green',
    worktopMaterial: 'Kashmir White Granite',
    worktopFinish: 'Polished',
    backsplashType: 'Full Height',
    applianceStrategy: 'Update to Professional'
  }
};

interface KitchenDesignSelectorProps {
  onSelectionsChange: (selections: KitchenDesignSelections) => void;
  initialSelections?: Partial<KitchenDesignSelections>;
}

export function KitchenDesignSelector({ 
  onSelectionsChange,
  initialSelections 
}: KitchenDesignSelectorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['cabinet', 'worktop']));
  const [selections, setSelections] = useState<KitchenDesignSelections>({
    cabinetStyle: 'Classic',
    cabinetMaterial: 'White Oak',
    hardware: 'None (Handleless)',
    worktopMaterial: 'Taj Mahal Quartzite',
    worktopFinish: 'Honed',
    worktopEdge: 'Eased',
    worktopThickness: 'Standard',
    backsplashType: 'Standard Height',
    backsplashMaterial: 'Match Worktop',
    applianceStrategy: 'Keep All Existing',
    applianceFinish: 'Stainless Steel',
    layoutElements: {
      island: true,
      peninsula: false,
      openShelving: false,
      upperCabinets: true,
      tallCabinets: true,
      windowAboveSink: true
    },
    flooring: 'Light Wood',
    wallColor: 'Warm White',
    lightingStyle: 'Minimal Recessed',
    ...initialSelections
  });

  // Update parent when selections change
  useEffect(() => {
    onSelectionsChange(selections);
  }, [selections, onSelectionsChange]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateSelection = <K extends keyof KitchenDesignSelections>(
    key: K,
    value: KitchenDesignSelections[K]
  ) => {
    setSelections(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (presetName: keyof typeof PRESET_COMBINATIONS) => {
    const preset = PRESET_COMBINATIONS[presetName];
    setSelections(prev => ({ 
      ...prev, 
      cabinetStyle: preset.cabinetStyle as KitchenDesignSelections['cabinetStyle'],
      cabinetMaterial: preset.cabinetMaterial as KitchenDesignSelections['cabinetMaterial'],
      ...(('cabinetColor' in preset) && preset.cabinetColor ? { cabinetColor: preset.cabinetColor as KitchenDesignSelections['cabinetColor'] } : {}),
      worktopMaterial: preset.worktopMaterial as KitchenDesignSelections['worktopMaterial'],
      worktopFinish: preset.worktopFinish as KitchenDesignSelections['worktopFinish'],
      backsplashType: preset.backsplashType as KitchenDesignSelections['backsplashType'],
      applianceStrategy: preset.applianceStrategy as KitchenDesignSelections['applianceStrategy']
    }));
  };

  return (
    <div className="space-y-4">
      {/* Preset Combinations */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Start Presets</h4>
        <div className="grid grid-cols-3 gap-2">
          {Object.keys(PRESET_COMBINATIONS).map((preset) => (
            <button
              key={preset}
              onClick={() => applyPreset(preset as keyof typeof PRESET_COMBINATIONS)}
              className="px-3 py-2 text-xs font-medium bg-white rounded-lg border border-gray-200 hover:border-unoform-gold hover:bg-unoform-gold/5 transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Cabinet Design */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('cabinet')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('cabinet') ? 
              <ChevronDownIcon className="w-5 h-5 text-gray-400" /> : 
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            }
            <h3 className="font-medium text-gray-900">Cabinet Design</h3>
            <span className="text-sm text-gray-500">
              {selections.cabinetStyle} • {selections.cabinetMaterial}
              {selections.cabinetMaterial === 'Painted' && selections.cabinetColor && ` • ${selections.cabinetColor}`}
            </span>
          </div>
        </button>
        
        {expandedSections.has('cabinet') && (
          <div className="px-4 py-4 border-t border-gray-200 space-y-4">
            {/* Style Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Style</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Classic', 'Copenhagen', 'Shaker', 'Avantgarde'] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => updateSelection('cabinetStyle', style)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      selections.cabinetStyle === style
                        ? 'border-unoform-gold bg-unoform-gold/10 text-unoform-gold'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Material Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Material</label>
              <div className="grid grid-cols-3 gap-2">
                {(['White Oak', 'Walnut', 'Ash', 'Smoked Oak', 'Black Oak', 'Painted'] as const).map(material => (
                  <button
                    key={material}
                    onClick={() => updateSelection('cabinetMaterial', material)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      selections.cabinetMaterial === material
                        ? 'border-unoform-gold bg-unoform-gold/10 text-unoform-gold'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {material}
                  </button>
                ))}
              </div>
            </div>

            {/* Paint Color (if painted) */}
            {selections.cabinetMaterial === 'Painted' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Paint Color</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Glacier White', 'Cream White', 'Sage Green', 'Kieselgrau', 'Steingrau', 'Olive', 'Charcoal', 'Matte Black'] as const).map(color => (
                    <button
                      key={color}
                      onClick={() => updateSelection('cabinetColor', color)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        selections.cabinetColor === color
                          ? 'border-unoform-gold bg-unoform-gold/10 text-unoform-gold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hardware */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Hardware</label>
              <div className="grid grid-cols-2 gap-2">
                {(['None (Handleless)', 'Brass Knobs', 'Black Metal Handles', 'Steel Bar Pulls', 'Integrated Grip'] as const).map(hardware => (
                  <button
                    key={hardware}
                    onClick={() => updateSelection('hardware', hardware)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      selections.hardware === hardware
                        ? 'border-unoform-gold bg-unoform-gold/10 text-unoform-gold'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {hardware}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Worktop Design */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('worktop')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('worktop') ? 
              <ChevronDownIcon className="w-5 h-5 text-gray-400" /> : 
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            }
            <h3 className="font-medium text-gray-900">Worktop & Countertops</h3>
            <span className="text-sm text-gray-500">
              {selections.worktopMaterial} • {selections.worktopFinish}
            </span>
          </div>
        </button>
        
        {expandedSections.has('worktop') && (
          <div className="px-4 py-4 border-t border-gray-200 space-y-4">
            {/* Material */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Material</label>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {Object.entries(MATERIAL_DESCRIPTIONS.worktop).map(([material, description]) => (
                  <button
                    key={material}
                    onClick={() => updateSelection('worktopMaterial', material as any)}
                    className={`px-3 py-2 text-left rounded-lg border transition-colors ${
                      selections.worktopMaterial === material
                        ? 'border-unoform-gold bg-unoform-gold/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{material}</div>
                    <div className="text-xs text-gray-500 mt-1">{description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Finish */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Finish</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(MATERIAL_DESCRIPTIONS.finishes).map(([finish, description]) => (
                  <button
                    key={finish}
                    onClick={() => updateSelection('worktopFinish', finish as any)}
                    className={`px-3 py-2 text-left rounded-lg border transition-colors ${
                      selections.worktopFinish === finish
                        ? 'border-unoform-gold bg-unoform-gold/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{finish}</div>
                    <div className="text-xs text-gray-500">{description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Edge & Thickness */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Edge</label>
                <select
                  value={selections.worktopEdge}
                  onChange={(e) => updateSelection('worktopEdge', e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-unoform-gold"
                >
                  {Object.keys(MATERIAL_DESCRIPTIONS.edges).map(edge => (
                    <option key={edge} value={edge}>{edge}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Thickness</label>
                <select
                  value={selections.worktopThickness}
                  onChange={(e) => updateSelection('worktopThickness', e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-unoform-gold"
                >
                  {(['Slim', 'Standard', 'Chunky'] as const).map(thickness => (
                    <option key={thickness} value={thickness}>{thickness}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backsplash */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('backsplash')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('backsplash') ? 
              <ChevronDownIcon className="w-5 h-5 text-gray-400" /> : 
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            }
            <h3 className="font-medium text-gray-900">Backsplash</h3>
            <span className="text-sm text-gray-500">
              {selections.backsplashType} • {selections.backsplashMaterial}
            </span>
          </div>
        </button>
        
        {expandedSections.has('backsplash') && (
          <div className="px-4 py-4 border-t border-gray-200 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                <select
                  value={selections.backsplashType}
                  onChange={(e) => updateSelection('backsplashType', e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-unoform-gold"
                >
                  {(['None', 'Standard Height', 'Full Height', 'Window Surround', 'Ledge Only'] as const).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Material</label>
                <select
                  value={selections.backsplashMaterial}
                  onChange={(e) => updateSelection('backsplashMaterial', e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-unoform-gold"
                  disabled={selections.backsplashType === 'None'}
                >
                  {(['Match Worktop', 'Contrasting Stone', 'Subway Tile', 'Large Format Tile', 'Glass', 'Metal'] as const).map(material => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Appliances */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('appliances')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('appliances') ? 
              <ChevronDownIcon className="w-5 h-5 text-gray-400" /> : 
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            }
            <h3 className="font-medium text-gray-900">Appliances</h3>
            <span className="text-sm text-gray-500">
              {selections.applianceStrategy}
            </span>
          </div>
        </button>
        
        {expandedSections.has('appliances') && (
          <div className="px-4 py-4 border-t border-gray-200 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Strategy</label>
              <select
                value={selections.applianceStrategy}
                onChange={(e) => updateSelection('applianceStrategy', e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-unoform-gold"
              >
                {(['Keep All Existing', 'Update to Integrated', 'Update to Professional', 'Remove Upper Appliances', 'Minimal Visible'] as const).map(strategy => (
                  <option key={strategy} value={strategy}>{strategy}</option>
                ))}
              </select>
            </div>
            
            {selections.applianceStrategy !== 'Keep All Existing' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Finish</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Stainless Steel', 'Black Stainless', 'Matte Black', 'Integrated Panels', 'White'] as const).map(finish => (
                    <button
                      key={finish}
                      onClick={() => updateSelection('applianceFinish', finish)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        selections.applianceFinish === finish
                          ? 'border-unoform-gold bg-unoform-gold/10 text-unoform-gold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {finish}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Environment & Layout */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('environment')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('environment') ? 
              <ChevronDownIcon className="w-5 h-5 text-gray-400" /> : 
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            }
            <h3 className="font-medium text-gray-900">Environment & Layout</h3>
          </div>
        </button>
        
        {expandedSections.has('environment') && (
          <div className="px-4 py-4 border-t border-gray-200 space-y-4">
            {/* Layout Elements */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Layout Features</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries({
                  island: 'Kitchen Island',
                  peninsula: 'Peninsula',
                  openShelving: 'Open Shelving',
                  upperCabinets: 'Upper Cabinets',
                  tallCabinets: 'Tall Cabinets',
                  windowAboveSink: 'Window Above Sink'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selections.layoutElements[key as keyof typeof selections.layoutElements]}
                      onChange={(e) => updateSelection('layoutElements', {
                        ...selections.layoutElements,
                        [key]: e.target.checked
                      })}
                      className="w-4 h-4 text-unoform-gold border-gray-300 rounded focus:ring-unoform-gold"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Flooring, Walls, Lighting */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Flooring</label>
                <select
                  value={selections.flooring}
                  onChange={(e) => updateSelection('flooring', e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-unoform-gold"
                >
                  {(['Light Wood', 'Dark Wood', 'Herringbone Wood', 'Large Tiles', 'Concrete', 'Natural Stone'] as const).map(floor => (
                    <option key={floor} value={floor}>{floor}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Wall Color</label>
                <select
                  value={selections.wallColor}
                  onChange={(e) => updateSelection('wallColor', e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-unoform-gold"
                >
                  {(['Bright White', 'Warm White', 'Light Grey', 'Beige', 'Sage', 'Charcoal'] as const).map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Lighting</label>
                <select
                  value={selections.lightingStyle}
                  onChange={(e) => updateSelection('lightingStyle', e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-unoform-gold"
                >
                  {(['Minimal Recessed', 'Statement Pendants', 'Under Cabinet LED', 'Track Lighting', 'Natural Light Focus'] as const).map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}