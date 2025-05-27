'use client';

import React, { useState, useMemo } from 'react';
import { ModelConfiguration, ScenarioType } from '@/types/models';
import { MODEL_CONFIGS } from '@/constants/models';
import { 
  Zap, 
  DollarSign, 
  Clock, 
  Check, 
  Info,
  Sparkles,
  Camera,
  Layers,
  Package,
  Cpu,
  Image as ImageIcon
} from 'lucide-react';

interface ModelHubProps {
  onModelSelect: (modelId: string) => void;
  currentModelId?: string;
  scenario?: ScenarioType;
}

interface ModelCardProps {
  model: ModelConfiguration;
  isSelected: boolean;
  isRecommended: boolean;
  onClick: () => void;
}

const capabilityIcons: Record<string, React.ElementType> = {
  'Structure Preservation': Layers,
  'Style Transfer': Sparkles,
  'Edge Detection': Camera,
  'Creative Freedom': Sparkles,
  'High Quality': ImageIcon,
  'Selective Editing': Package,
  'Context Aware': Cpu,
  'Material Transfer': Package,
  'Element Transfer': Layers
};

const scenarioRecommendations: Record<ScenarioType, string[]> = {
  'style-transfer': ['flux-redux-dev', 'flux-1.1-pro'],
  'empty-room': ['flux-depth-dev', 'flux-1.1-pro'],
  'multi-reference': ['flux-redux-dev', 'flux-fill-pro']
};

function ModelCard({ model, isSelected, isRecommended, onClick }: ModelCardProps) {
  const getPerformanceColor = (quality?: string) => {
    if (!quality) return 'text-gray-500';
    switch (quality) {
      case 'high': return 'text-green-600';
      case 'standard': return 'text-blue-600';
      case 'draft': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div 
      className={`
        relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
        ${isSelected 
          ? 'border-primary bg-primary/5 shadow-lg' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
      `}
      onClick={onClick}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
      )}

      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Recommended
        </div>
      )}

      {/* Model Header */}
      <div className="mb-3">
        <h3 className="font-semibold text-lg">{model.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{model.description}</p>
      </div>

      {/* Capabilities */}
      <div className="mb-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Capabilities</h4>
        <div className="flex flex-wrap gap-1">
          {model.capabilities.slice(0, 3).map((capability, idx) => {
            const Icon = capabilityIcons[capability.name] || Info;
            return (
              <div 
                key={idx}
                className="flex items-center gap-1 text-xs bg-gray-100 rounded-full px-2 py-1"
                title={capability.description}
              >
                <Icon className="h-3 w-3" />
                <span>{capability.name}</span>
              </div>
            );
          })}
          {model.capabilities.length > 3 && (
            <span className="text-xs text-gray-500">+{model.capabilities.length - 3} more</span>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-gray-400" />
          <span className="text-gray-600">{model.averageTime}s</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3 text-gray-400" />
          <span className="text-gray-600">${model.costPerRun.toFixed(3)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-gray-400" />
          <span className={getPerformanceColor(model.performance?.quality)}>
            {model.performance?.quality || 'standard'}
          </span>
        </div>
      </div>

      {/* Model Type Badge */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
          {model.type}
        </span>
      </div>
    </div>
  );
}

export function ModelHub({ onModelSelect, currentModelId, scenario }: ModelHubProps) {
  const [filter, setFilter] = useState<'all' | 'recommended'>('recommended');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);

  // Get models as array from the config object
  const allModels = useMemo(() => {
    return Object.values(MODEL_CONFIGS);
  }, []);

  // Get unique capabilities across all models
  const allCapabilities = useMemo(() => {
    const caps = new Set<string>();
    allModels.forEach(model => {
      model.capabilities.forEach(cap => caps.add(cap.name));
    });
    return Array.from(caps);
  }, [allModels]);

  // Filter models based on current settings
  const filteredModels = useMemo(() => {
    let models = allModels;

    // Filter by scenario recommendations
    if (filter === 'recommended' && scenario) {
      const recommendedIds = scenarioRecommendations[scenario] || [];
      models = models.filter(model => recommendedIds.includes(model.id));
    }

    // Filter by selected capabilities
    if (selectedCapabilities.length > 0) {
      models = models.filter(model => 
        selectedCapabilities.every(cap => 
          model.capabilities.some(modelCap => modelCap.name === cap)
        )
      );
    }

    return models;
  }, [allModels, filter, scenario, selectedCapabilities]);

  const toggleCapability = (capability: string) => {
    setSelectedCapabilities(prev => 
      prev.includes(capability)
        ? prev.filter(c => c !== capability)
        : [...prev, capability]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Model Selection</h2>
        <p className="text-gray-600 mt-1">
          Choose the best model for your {scenario ? scenario.replace('-', ' ') : 'task'}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('recommended')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'recommended'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Recommended
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Models
          </button>
        </div>

        {/* Capability Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Filter by Capabilities</h3>
          <div className="flex flex-wrap gap-2">
            {allCapabilities.map(capability => {
              const Icon = capabilityIcons[capability] || Info;
              const isSelected = selectedCapabilities.includes(capability);
              
              return (
                <button
                  key={capability}
                  onClick={() => toggleCapability(capability)}
                  className={`
                    flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors
                    ${isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="h-3 w-3" />
                  <span>{capability}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModels.map(model => {
          const isRecommended = scenario 
            ? scenarioRecommendations[scenario]?.includes(model.id) 
            : false;
          
          return (
            <ModelCard
              key={model.id}
              model={model}
              isSelected={currentModelId === model.id}
              isRecommended={isRecommended}
              onClick={() => onModelSelect(model.id)}
            />
          );
        })}
      </div>

      {/* No Results */}
      {filteredModels.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No models match your current filters.</p>
          <button 
            onClick={() => {
              setFilter('all');
              setSelectedCapabilities([]);
            }}
            className="mt-2 text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Model Comparison */}
      {filteredModels.length > 1 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Quick Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="pr-4">Model</th>
                  <th className="px-4">Cost</th>
                  <th className="px-4">Speed</th>
                  <th className="px-4">Quality</th>
                  <th className="pl-4">Best For</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map(model => (
                  <tr key={model.id} className="border-t border-gray-200">
                    <td className="pr-4 py-2 font-medium">{model.name}</td>
                    <td className="px-4 py-2">${model.costPerRun.toFixed(3)}</td>
                    <td className="px-4 py-2">{model.averageTime}s</td>
                    <td className="px-4 py-2">
                      <span className={getPerformanceColor(model.performance?.quality)}>
                        {model.performance?.quality || 'standard'}
                      </span>
                    </td>
                    <td className="pl-4 py-2 text-gray-600">
                      {model.capabilities[0]?.name || 'General use'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function getPerformanceColor(quality?: string): string {
  if (!quality) return 'text-gray-500';
  switch (quality) {
    case 'high': return 'text-green-600';
    case 'standard': return 'text-blue-600';
    case 'draft': return 'text-yellow-600';
    default: return 'text-gray-500';
  }
}