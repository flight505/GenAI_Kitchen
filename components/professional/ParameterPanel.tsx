'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ModelConfiguration, ParameterDefinition } from '@/types/models';
import { MODEL_CONFIGS } from '@/constants/models';
import { 
  Info, 
  Save, 
  Upload, 
  RotateCcw,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Clock
} from 'lucide-react';

interface ParameterPanelProps {
  modelId: string;
  onChange: (params: Record<string, any>) => void;
  presets?: ParameterPreset[];
  scenario?: string;
}

interface ParameterPreset {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
}

interface ParameterControlProps {
  parameter: ParameterDefinition;
  value: any;
  onChange: (value: any) => void;
  locked?: boolean;
  onLockToggle?: () => void;
}

// Default presets for common scenarios
const defaultPresets: Record<string, ParameterPreset[]> = {
  'style-transfer': [
    {
      id: 'subtle',
      name: 'Subtle Transfer',
      description: 'Light style influence, preserve original',
      parameters: { guidance: 3, num_inference_steps: 20, megapixels: '1' }
    },
    {
      id: 'balanced',
      name: 'Balanced Transfer',
      description: 'Medium influence, good balance',
      parameters: { guidance: 5, num_inference_steps: 28, megapixels: '1' }
    },
    {
      id: 'strong',
      name: 'Strong Transfer',
      description: 'Heavy style influence',
      parameters: { guidance: 8, num_inference_steps: 40, megapixels: '1' }
    }
  ],
  'empty-room': [
    {
      id: 'quick-preview',
      name: 'Quick Preview',
      description: 'Fast generation for concept validation',
      parameters: { guidance: 30, steps: 20, safety_tolerance: 2 }
    },
    {
      id: 'detailed',
      name: 'Detailed Render',
      description: 'High quality with full details',
      parameters: { guidance: 50, steps: 50, safety_tolerance: 2 }
    }
  ]
};

function ParameterControl({ parameter, value, onChange, locked, onLockToggle }: ParameterControlProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const renderControl = () => {
    switch (parameter.type) {
      case 'number':
        return (
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={parameter.min}
              max={parameter.max}
              step={(parameter.max! - parameter.min!) / 100}
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              disabled={locked}
              className="flex-1"
            />
            <input
              type="number"
              min={parameter.min}
              max={parameter.max}
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              disabled={locked}
              className="w-20 px-2 py-1 text-sm border rounded"
            />
          </div>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={locked}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {parameter.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              disabled={locked}
              className="w-4 h-4"
            />
            <span className="text-sm">Enable</span>
          </label>
        );

      case 'string':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={locked}
            className="w-full px-3 py-2 border rounded-lg resize-none"
            rows={3}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{parameter.name}</label>
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="relative"
          >
            <Info className="h-3 w-3 text-gray-400" />
            {showTooltip && (
              <div className="absolute z-10 w-64 p-2 text-xs bg-gray-900 text-white rounded-lg -top-2 left-6">
                {parameter.description}
                {parameter.min !== undefined && parameter.max !== undefined && (
                  <div className="mt-1 text-gray-300">
                    Range: {parameter.min} - {parameter.max}
                  </div>
                )}
              </div>
            )}
          </button>
        </div>
        {onLockToggle && (
          <button
            onClick={onLockToggle}
            className="p-1 hover:bg-gray-100 rounded"
            title={locked ? 'Unlock parameter' : 'Lock parameter'}
          >
            {locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
          </button>
        )}
      </div>
      {renderControl()}
    </div>
  );
}

export function ParameterPanel({ modelId, onChange, presets = [], scenario }: ParameterPanelProps) {
  const [mode, setMode] = useState<'guided' | 'expert'>('guided');
  const [params, setParams] = useState<Record<string, any>>({});
  const [lockedParams, setLockedParams] = useState<Set<string>>(new Set());
  const [customPresets, setCustomPresets] = useState<ParameterPreset[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['required']));
  
  const model = MODEL_CONFIGS[modelId];
  const scenarioPresets = scenario ? defaultPresets[scenario] || [] : [];
  const allPresets = [...presets, ...scenarioPresets, ...customPresets];

  // Initialize parameters with defaults
  useEffect(() => {
    if (model) {
      const defaults = { ...model.parameters.defaults };
      model.parameters.required.forEach(param => {
        if (param.default !== undefined) {
          defaults[param.name] = param.default;
        }
      });
      setParams(defaults);
      onChange(defaults);
    }
  }, [modelId, model]);

  const updateParam = useCallback((key: string, value: any) => {
    if (lockedParams.has(key)) return;
    
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    onChange(newParams);
  }, [params, lockedParams, onChange]);

  const toggleLock = (paramName: string) => {
    const newLocked = new Set(lockedParams);
    if (newLocked.has(paramName)) {
      newLocked.delete(paramName);
    } else {
      newLocked.add(paramName);
    }
    setLockedParams(newLocked);
  };

  const applyPreset = (preset: ParameterPreset) => {
    const newParams = { ...params };
    Object.entries(preset.parameters).forEach(([key, value]) => {
      if (!lockedParams.has(key)) {
        newParams[key] = value;
      }
    });
    setParams(newParams);
    onChange(newParams);
  };

  const resetToDefaults = () => {
    if (model) {
      const defaults = { ...model.parameters.defaults };
      const newParams = { ...params };
      Object.entries(defaults).forEach(([key, value]) => {
        if (!lockedParams.has(key)) {
          newParams[key] = value;
        }
      });
      setParams(newParams);
      onChange(newParams);
    }
  };

  const saveAsPreset = () => {
    const name = prompt('Preset name:');
    if (name) {
      const newPreset: ParameterPreset = {
        id: Date.now().toString(),
        name,
        description: `Custom preset for ${model?.name}`,
        parameters: { ...params }
      };
      setCustomPresets([...customPresets, newPreset]);
    }
  };

  const calculateCost = () => {
    if (!model) return 0;
    const numOutputs = params.num_outputs || 1;
    return model.costPerRun * numOutputs;
  };

  const estimateTime = () => {
    if (!model) return 0;
    const steps = params.num_inference_steps || params.steps || 28;
    const baseTime = model.averageTime;
    return Math.round(baseTime * (steps / 28)); // Rough estimate
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (!model) return null;

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Parameters</h2>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode('guided')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              mode === 'guided' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Guided
          </button>
          <button
            onClick={() => setMode('expert')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              mode === 'expert' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Expert
          </button>
        </div>
      </div>

      {mode === 'guided' ? (
        <div className="space-y-6">
          {/* Presets */}
          {allPresets.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Quick Presets</h3>
              <div className="grid grid-cols-2 gap-2">
                {allPresets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-sm">{preset.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Essential Parameters */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Essential Settings</h3>
            {model.parameters.required.map(param => (
              <ParameterControl
                key={param.name}
                parameter={param}
                value={params[param.name] ?? param.default}
                onChange={(value) => updateParam(param.name, value)}
                locked={lockedParams.has(param.name)}
                onLockToggle={() => toggleLock(param.name)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Required Parameters */}
          <div>
            <button
              onClick={() => toggleSection('required')}
              className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg"
            >
              <h3 className="text-sm font-semibold text-gray-700">Required Parameters</h3>
              {expandedSections.has('required') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedSections.has('required') && (
              <div className="mt-2 space-y-3 pl-2">
                {model.parameters.required.map(param => (
                  <ParameterControl
                    key={param.name}
                    parameter={param}
                    value={params[param.name] ?? param.default}
                    onChange={(value) => updateParam(param.name, value)}
                    locked={lockedParams.has(param.name)}
                    onLockToggle={() => toggleLock(param.name)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Optional Parameters */}
          <div>
            <button
              onClick={() => toggleSection('optional')}
              className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg"
            >
              <h3 className="text-sm font-semibold text-gray-700">Optional Parameters</h3>
              {expandedSections.has('optional') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedSections.has('optional') && (
              <div className="mt-2 space-y-3 pl-2">
                {model.parameters.optional.map(param => (
                  <ParameterControl
                    key={param.name}
                    parameter={param}
                    value={params[param.name] ?? param.default}
                    onChange={(value) => updateParam(param.name, value)}
                    locked={lockedParams.has(param.name)}
                    onLockToggle={() => toggleLock(param.name)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cost & Time Estimation */}
      <div className="p-4 bg-gray-50 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Estimated Cost</span>
          </div>
          <span className="text-sm font-semibold">${calculateCost().toFixed(3)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Processing Time</span>
          </div>
          <span className="text-sm font-semibold">~{estimateTime()}s</span>
        </div>
        {params.num_outputs > 1 && (
          <div className="text-xs text-gray-600 mt-1">
            Generating {params.num_outputs} images
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={saveAsPreset}
          className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
        >
          <Save className="h-4 w-4" />
          Save Preset
        </button>
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
        <button
          className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 ml-auto"
        >
          <Upload className="h-4 w-4" />
          Import
        </button>
      </div>
    </div>
  );
}