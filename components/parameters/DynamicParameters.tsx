'use client';

import React, { useState } from 'react';
import {
  InformationCircleIcon,
  ArrowPathIcon,
  BookmarkIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';
import { ModelType } from '../../types/models';
import ParameterTooltip from './ParameterTooltip';

interface ParameterSchema {
  name: string;
  key: string;
  type: 'slider' | 'number' | 'select' | 'toggle';
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: any; label: string }>;
  default: any;
  description: string;
  advanced?: boolean;
  dependsOn?: {
    parameter: string;
    value: any;
  };
  group: 'generation' | 'quality' | 'preservation' | 'advanced';
}

interface ParameterPreset {
  id: string;
  name: string;
  description: string;
  values: Record<string, any>;
}

const modelParameters: Record<string, ParameterSchema[]> = {
  'canny-pro': [
    {
      name: 'Guidance Scale',
      key: 'guidance',
      type: 'slider',
      min: 1,
      max: 50,
      step: 0.5,
      default: 30,
      description: 'Controls how closely the AI follows your prompt. Higher values = more literal interpretation.',
      group: 'generation'
    },
    {
      name: 'Inference Steps',
      key: 'steps',
      type: 'slider',
      min: 10,
      max: 100,
      step: 5,
      default: 50,
      description: 'Number of denoising steps. More steps = higher quality but slower generation.',
      group: 'quality'
    },
    {
      name: 'Structure Strength',
      key: 'strength',
      type: 'slider',
      min: 0.1,
      max: 1.0,
      step: 0.05,
      default: 0.8,
      description: 'How strongly to preserve the original structure. Lower = more creative freedom.',
      group: 'generation'
    },
    {
      name: 'Safety Tolerance',
      key: 'safety_tolerance',
      type: 'slider',
      min: 1,
      max: 5,
      step: 1,
      default: 2,
      description: 'Content filtering level. Higher = more permissive.',
      group: 'advanced',
      advanced: true
    }
  ],
  'flux-pro': [
    {
      name: 'Guidance Scale',
      key: 'guidance_scale',
      type: 'slider',
      min: 1,
      max: 20,
      step: 0.5,
      default: 3.5,
      description: 'Controls adherence to prompt. Lower values = more creative interpretation.',
      group: 'generation'
    },
    {
      name: 'Number of Outputs',
      key: 'num_outputs',
      type: 'select',
      options: [
        { value: 1, label: '1 image' },
        { value: 2, label: '2 images' },
        { value: 4, label: '4 images' }
      ],
      default: 1,
      description: 'Generate multiple variations at once.',
      group: 'generation'
    },
    {
      name: 'Output Format',
      key: 'output_format',
      type: 'select',
      options: [
        { value: 'webp', label: 'WebP (Recommended)' },
        { value: 'jpg', label: 'JPEG' },
        { value: 'png', label: 'PNG' }
      ],
      default: 'webp',
      description: 'File format for generated images.',
      group: 'quality'
    },
    {
      name: 'Output Quality',
      key: 'output_quality',
      type: 'slider',
      min: 50,
      max: 100,
      step: 5,
      default: 80,
      description: 'JPEG/WebP compression quality.',
      group: 'quality',
      dependsOn: {
        parameter: 'output_format',
        value: ['webp', 'jpg']
      }
    }
  ]
};

const parameterPresets: ParameterPreset[] = [
  {
    id: 'fast',
    name: 'Fast Generation',
    description: 'Optimized for speed',
    values: {
      guidance: 15,
      steps: 20,
      strength: 0.7
    }
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Good quality and speed',
    values: {
      guidance: 25,
      steps: 35,
      strength: 0.8
    }
  },
  {
    id: 'quality',
    name: 'High Quality',
    description: 'Maximum quality',
    values: {
      guidance: 35,
      steps: 50,
      strength: 0.85
    }
  }
];

interface DynamicParametersProps {
  modelType: ModelType;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  showAdvanced?: boolean;
  className?: string;
}

export default function DynamicParameters({
  modelType,
  values,
  onChange,
  showAdvanced = false,
  className = ''
}: DynamicParametersProps) {
  const [lockedParameters, setLockedParameters] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['generation', 'quality']));

  const parameters = modelParameters[modelType] || [];
  
  // Filter parameters based on visibility and dependencies
  const visibleParameters = parameters.filter(param => {
    if (param.advanced && !showAdvanced) return false;
    
    if (param.dependsOn) {
      const dependValue = values[param.dependsOn.parameter];
      if (Array.isArray(param.dependsOn.value)) {
        return param.dependsOn.value.includes(dependValue);
      }
      return dependValue === param.dependsOn.value;
    }
    
    return true;
  });

  // Group parameters
  const groupedParameters = visibleParameters.reduce((acc, param) => {
    if (!acc[param.group]) acc[param.group] = [];
    acc[param.group].push(param);
    return acc;
  }, {} as Record<string, ParameterSchema[]>);

  const handleValueChange = (key: string, value: any) => {
    if (lockedParameters.has(key)) return;
    onChange({ ...values, [key]: value });
  };

  const applyPreset = (preset: ParameterPreset) => {
    const newValues = { ...values };
    Object.entries(preset.values).forEach(([key, value]) => {
      if (!lockedParameters.has(key)) {
        newValues[key] = value;
      }
    });
    onChange(newValues);
  };

  const resetToDefaults = () => {
    const newValues = { ...values };
    parameters.forEach(param => {
      if (!lockedParameters.has(param.key)) {
        newValues[param.key] = param.default;
      }
    });
    onChange(newValues);
  };

  const toggleParameterLock = (key: string) => {
    const newLocked = new Set(lockedParameters);
    if (newLocked.has(key)) {
      newLocked.delete(key);
    } else {
      newLocked.add(key);
    }
    setLockedParameters(newLocked);
  };

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  const renderParameter = (param: ParameterSchema) => {
    const value = values[param.key] ?? param.default;
    const isLocked = lockedParameters.has(param.key);

    return (
      <div key={param.key} className={`space-y-2 ${isLocked ? 'opacity-60' : ''}`}>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            {param.name}
            <button
              onClick={() => toggleParameterLock(param.key)}
              className="p-0.5 hover:bg-gray-100 rounded"
            >
              {isLocked ? (
                <LockClosedIcon className="w-3.5 h-3.5 text-gray-500" />
              ) : (
                <LockOpenIcon className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </label>
          <span className="text-sm text-gray-500">{value}</span>
        </div>

        {param.type === 'slider' && (
          <div className="relative">
            <input
              type="range"
              min={param.min}
              max={param.max}
              step={param.step}
              value={value}
              onChange={(e) => handleValueChange(param.key, parseFloat(e.target.value))}
              disabled={isLocked}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, #C19A5B 0%, #C19A5B ${((value - (param.min || 0)) / ((param.max || 100) - (param.min || 0))) * 100}%, #E5E7EB ${((value - (param.min || 0)) / ((param.max || 100) - (param.min || 0))) * 100}%, #E5E7EB 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{param.min}</span>
              <span>{param.max}</span>
            </div>
          </div>
        )}

        {param.type === 'select' && (
          <select
            value={value}
            onChange={(e) => handleValueChange(param.key, e.target.value)}
            disabled={isLocked}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C19A5B] focus:border-transparent disabled:cursor-not-allowed"
          >
            {param.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {param.type === 'number' && (
          <input
            type="number"
            min={param.min}
            max={param.max}
            step={param.step}
            value={value}
            onChange={(e) => handleValueChange(param.key, parseFloat(e.target.value))}
            disabled={isLocked}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C19A5B] focus:border-transparent disabled:cursor-not-allowed"
          />
        )}

        {param.type === 'toggle' && (
          <button
            onClick={() => handleValueChange(param.key, !value)}
            disabled={isLocked}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed ${
              value ? 'bg-[#C19A5B]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        )}

        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500">{param.description}</p>
          <ParameterTooltip parameter={param.key} />
        </div>
      </div>
    );
  };

  const groupLabels: Record<string, string> = {
    generation: 'Generation Settings',
    quality: 'Quality Settings',
    preservation: 'Preservation Options',
    advanced: 'Advanced Settings'
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Presets */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Parameter Presets</h3>
        <button
          onClick={resetToDefaults}
          className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <ArrowPathIcon className="w-3.5 h-3.5" />
          Reset to defaults
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {parameterPresets.map(preset => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className="p-2 border border-gray-200 rounded-lg hover:border-[#C19A5B] hover:bg-[#C19A5B]/5 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900">{preset.name}</div>
            <div className="text-xs text-gray-500">{preset.description}</div>
          </button>
        ))}
      </div>

      {/* Grouped Parameters */}
      {Object.entries(groupedParameters).map(([group, params]) => (
        <div key={group} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleGroup(group)}
            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
          >
            <span className="text-sm font-medium text-gray-900">
              {groupLabels[group] || group}
            </span>
            <span className="text-xs text-gray-500">
              {params.length} {params.length === 1 ? 'parameter' : 'parameters'}
            </span>
          </button>

          {expandedGroups.has(group) && (
            <div className="p-4 space-y-4">
              {params.map(param => renderParameter(param))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}