'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export type ModelType = 'canny-pro' | 'flux-pro';

interface ModelTab {
  id: ModelType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge: string;
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  isDefault?: boolean;
}

interface ModelSelectionTabsProps {
  selectedModel: ModelType;
  onModelSelect: (model: ModelType) => void;
  disabled?: boolean;
}

const modelTabs: ModelTab[] = [
  {
    id: 'canny-pro',
    icon: ShieldCheckIcon,
    label: 'Keep Structure',
    badge: 'FLUX Canny Pro',
    title: 'Preserve exact kitchen layout',
    description: 'Maintains walls, cabinets, and perspective while changing style. Perfect for first-time generation and when you like the current layout.',
    features: [
      'Preserves exact room structure',
      'Maintains cabinet placement',
      'Keeps architectural elements',
      'Best for style updates'
    ],
    buttonText: 'Use Structure Mode',
    isDefault: true
  },
  {
    id: 'flux-pro',
    icon: SparklesIcon,
    label: 'Creative Mode',
    badge: 'FLUX 1.1 Pro',
    title: 'Generate fresh kitchen design',
    description: 'Complete redesign with creative freedom. Best for dramatic transformations and exploring new layouts.',
    features: [
      'Full creative freedom',
      'Can change layout',
      'More artistic interpretation',
      'Best for new concepts'
    ],
    buttonText: 'Use Creative Mode'
  }
];

export default function ModelSelectionTabs({ 
  selectedModel, 
  onModelSelect,
  disabled = false 
}: ModelSelectionTabsProps) {
  const [hoveredTab, setHoveredTab] = useState<ModelType | null>(null);

  return (
    <div className="w-full space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-work font-medium text-unoform-gray-dark">
          Generation Mode
        </h3>
        <p className="text-sm text-unoform-gray">
          Choose how you want to transform your kitchen
        </p>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        {modelTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !disabled && onModelSelect(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            disabled={disabled}
            className={`
              relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
              rounded-md font-medium text-sm transition-all duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${selectedModel === tab.id 
                ? 'bg-white text-unoform-gray-dark shadow-sm' 
                : 'text-unoform-gray hover:text-unoform-gray-dark'
              }
            `}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {tab.isDefault && (
              <span className="text-xs bg-unoform-gold/10 text-unoform-gold px-1.5 py-0.5 rounded">
                DEFAULT
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {modelTabs.map((tab) => {
          if (selectedModel !== tab.id) return null;

          return (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-block px-2 py-1 bg-unoform-gold/10 text-unoform-gold text-xs font-medium rounded mb-2">
                      {tab.badge}
                    </span>
                    <h4 className="text-xl font-work font-medium text-unoform-gray-dark">
                      {tab.title}
                    </h4>
                  </div>
                  <tab.icon className="h-8 w-8 text-unoform-gold" />
                </div>

                {/* Description */}
                <p className="text-unoform-gray mb-6">
                  {tab.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {tab.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircleIcon className="h-5 w-5 text-unoform-gold flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-unoform-gray-dark">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Visual Preview Placeholder */}
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <tab.icon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Model preview</p>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedModel === tab.id && (
                  <div className="flex items-center gap-2 p-3 bg-unoform-gold/10 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5 text-unoform-gold" />
                    <span className="text-sm font-medium text-unoform-gold">
                      Currently selected
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Additional Info */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> Start with "Keep Structure" mode to maintain your kitchen's layout, 
          then use "Creative Mode" for more experimental variations.
        </p>
      </div>
    </div>
  );
}