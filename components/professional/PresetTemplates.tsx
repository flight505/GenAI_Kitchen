'use client';

import React, { useState } from 'react';
import { 
  Sparkles,
  Palette,
  Home,
  Layers,
  ChevronRight,
  Check,
  Clock,
  Users,
  Zap,
  TrendingUp
} from 'lucide-react';

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  scenario: 'style-transfer' | 'empty-room' | 'multi-reference' | 'batch-processing';
  prompt: string;
  parameters: Record<string, any>;
  estimatedTime: string;
  popularity: 'high' | 'medium' | 'low';
  tags: string[];
}

interface PresetTemplatesProps {
  scenario: 'style-transfer' | 'empty-room' | 'multi-reference' | 'batch-processing';
  onSelect: (preset: PresetTemplate) => void;
  className?: string;
}

const presetTemplates: PresetTemplate[] = [
  // Style Transfer Presets
  {
    id: 'modern-scandi',
    name: 'Modern Scandinavian',
    description: 'Clean lines with natural wood and white surfaces',
    icon: <Sparkles className="h-5 w-5" />,
    scenario: 'style-transfer',
    prompt: 'modern Scandinavian kitchen with light oak cabinets, white quartz countertops, minimalist hardware, matte black fixtures',
    parameters: {
      guidance_scale: 7.5,
      prompt_strength: 0.8,
      num_inference_steps: 30
    },
    estimatedTime: '45s',
    popularity: 'high',
    tags: ['minimalist', 'light', 'nordic']
  },
  {
    id: 'industrial-chic',
    name: 'Industrial Chic',
    description: 'Raw materials with sophisticated finishes',
    icon: <Layers className="h-5 w-5" />,
    scenario: 'style-transfer',
    prompt: 'industrial style kitchen with dark metal cabinets, concrete countertops, exposed brick, copper accents, pendant lighting',
    parameters: {
      guidance_scale: 8,
      prompt_strength: 0.85,
      num_inference_steps: 35
    },
    estimatedTime: '50s',
    popularity: 'medium',
    tags: ['urban', 'modern', 'bold']
  },
  {
    id: 'coastal-fresh',
    name: 'Coastal Fresh',
    description: 'Bright and airy with ocean-inspired colors',
    icon: <Palette className="h-5 w-5" />,
    scenario: 'style-transfer',
    prompt: 'coastal kitchen with shaker cabinets in soft blue, white marble countertops, brass hardware, natural light',
    parameters: {
      guidance_scale: 7,
      prompt_strength: 0.75,
      num_inference_steps: 28
    },
    estimatedTime: '40s',
    popularity: 'high',
    tags: ['bright', 'beachy', 'relaxed']
  },

  // Empty Room Presets
  {
    id: 'compact-efficient',
    name: 'Compact Efficiency',
    description: 'Smart layout for smaller spaces',
    icon: <Home className="h-5 w-5" />,
    scenario: 'empty-room',
    prompt: 'compact kitchen with L-shaped layout, wall-mounted storage, integrated appliances, light colors to maximize space',
    parameters: {
      guidance_scale: 3.5,
      num_inference_steps: 28,
      roomDimensions: { width: 3, height: 2.5, depth: 3 },
      lightingCondition: 'bright'
    },
    estimatedTime: '35s',
    popularity: 'high',
    tags: ['small', 'efficient', 'smart']
  },
  {
    id: 'open-concept',
    name: 'Open Concept',
    description: 'Spacious design with island centerpiece',
    icon: <Layers className="h-5 w-5" />,
    scenario: 'empty-room',
    prompt: 'open concept kitchen with large island, pendant lighting, floor-to-ceiling cabinets, seamless flow to living area',
    parameters: {
      guidance_scale: 4,
      num_inference_steps: 30,
      roomDimensions: { width: 6, height: 2.8, depth: 5 },
      lightingCondition: 'natural'
    },
    estimatedTime: '40s',
    popularity: 'high',
    tags: ['spacious', 'modern', 'entertaining']
  },
  {
    id: 'galley-optimize',
    name: 'Galley Optimization',
    description: 'Maximize narrow spaces efficiently',
    icon: <TrendingUp className="h-5 w-5" />,
    scenario: 'empty-room',
    prompt: 'galley kitchen with parallel counters, strategic lighting, pull-out storage, light reflective surfaces',
    parameters: {
      guidance_scale: 3.8,
      num_inference_steps: 26,
      roomDimensions: { width: 2.5, height: 2.5, depth: 4 },
      lightingCondition: 'bright'
    },
    estimatedTime: '35s',
    popularity: 'medium',
    tags: ['narrow', 'functional', 'clever']
  },

  // Multi-Reference Presets
  {
    id: 'style-fusion',
    name: 'Style Fusion',
    description: 'Blend multiple design influences seamlessly',
    icon: <Zap className="h-5 w-5" />,
    scenario: 'multi-reference',
    prompt: 'harmonious blend of modern and traditional elements, balanced color palette, cohesive material selection',
    parameters: {
      guidance_scale: 5,
      num_inference_steps: 40,
      reference_weights: [0.4, 0.3, 0.3]
    },
    estimatedTime: '60s',
    popularity: 'medium',
    tags: ['eclectic', 'balanced', 'unique']
  },
  {
    id: 'element-merge',
    name: 'Element Merge',
    description: 'Combine specific features from each reference',
    icon: <Layers className="h-5 w-5" />,
    scenario: 'multi-reference',
    prompt: 'selective integration focusing on cabinets from first, countertops from second, overall style from third reference',
    parameters: {
      guidance_scale: 6,
      num_inference_steps: 45,
      reference_weights: [0.35, 0.35, 0.3]
    },
    estimatedTime: '65s',
    popularity: 'low',
    tags: ['precise', 'custom', 'detailed']
  },
  {
    id: 'color-harmony',
    name: 'Color Harmony',
    description: 'Unify different styles through color',
    icon: <Palette className="h-5 w-5" />,
    scenario: 'multi-reference',
    prompt: 'unified color scheme across all references, maintaining individual style elements while creating visual cohesion',
    parameters: {
      guidance_scale: 5.5,
      num_inference_steps: 38,
      reference_weights: [0.33, 0.33, 0.34]
    },
    estimatedTime: '55s',
    popularity: 'medium',
    tags: ['cohesive', 'color-focused', 'harmonious']
  },
  
  // Batch Processing Presets
  {
    id: 'batch-quick-style',
    name: 'Quick Style Apply',
    description: 'Fast processing with balanced quality',
    icon: <Zap className="h-5 w-5" />,
    scenario: 'batch-processing',
    prompt: 'apply reference kitchen style maintaining original layout, focus on cabinet style and color scheme',
    parameters: {
      guidance_scale: 7,
      num_inference_steps: 25,
      batch_size: 5
    },
    estimatedTime: '30s per image',
    popularity: 'high',
    tags: ['fast', 'efficient', 'bulk']
  },
  {
    id: 'batch-high-quality',
    name: 'High Quality Batch',
    description: 'Maximum quality for client presentations',
    icon: <Sparkles className="h-5 w-5" />,
    scenario: 'batch-processing',
    prompt: 'detailed style transfer with careful attention to materials, lighting, and finish quality',
    parameters: {
      guidance_scale: 8.5,
      num_inference_steps: 40,
      batch_size: 3
    },
    estimatedTime: '50s per image',
    popularity: 'medium',
    tags: ['quality', 'detailed', 'professional']
  },
  {
    id: 'batch-volume',
    name: 'Volume Processing',
    description: 'Optimized for large batches',
    icon: <Layers className="h-5 w-5" />,
    scenario: 'batch-processing',
    prompt: 'consistent style application across all images, maintaining brand coherence',
    parameters: {
      guidance_scale: 6.5,
      num_inference_steps: 20,
      batch_size: 10
    },
    estimatedTime: '20s per image',
    popularity: 'low',
    tags: ['volume', 'speed', 'consistency']
  }
];

export function PresetTemplates({ scenario, onSelect, className }: PresetTemplatesProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);
  
  const scenarioPresets = presetTemplates.filter(preset => preset.scenario === scenario);
  
  const getPopularityIcon = (popularity: string) => {
    switch (popularity) {
      case 'high':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'medium':
        return <Users className="h-3 w-3 text-yellow-600" />;
      case 'low':
        return <Clock className="h-3 w-3 text-gray-400" />;
      default:
        return null;
    }
  };
  
  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-900 mb-1">Quick Start Templates</h3>
        <p className="text-xs text-gray-500">Select a preset to quickly configure your generation</p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {scenarioPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => {
              setSelectedPreset(preset.id);
              onSelect(preset);
            }}
            onMouseEnter={() => setHoveredPreset(preset.id)}
            onMouseLeave={() => setHoveredPreset(null)}
            className={`
              relative group text-left p-4 rounded-lg border transition-all
              ${selectedPreset === preset.id 
                ? 'border-unoform-gold bg-unoform-gold/5' 
                : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`
                p-2 rounded-lg transition-colors
                ${selectedPreset === preset.id 
                  ? 'bg-unoform-gold/10 text-unoform-gold' 
                  : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                }
              `}>
                {preset.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900">{preset.name}</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getPopularityIcon(preset.popularity)}
                    </div>
                    <span className="text-xs text-gray-500">{preset.estimatedTime}</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mb-2">{preset.description}</p>
                
                <div className="flex items-center gap-1 flex-wrap">
                  {preset.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className={`
                transition-all transform
                ${hoveredPreset === preset.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}
              `}>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
              
              {selectedPreset === preset.id && (
                <div className="absolute top-2 right-2">
                  <div className="p-1 bg-unoform-gold rounded-full">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
          <div>
            <p className="text-xs text-blue-900 font-medium">Pro Tip</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Templates are starting points. You can further customize all parameters after selection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}