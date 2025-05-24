'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  ClockIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { ModelType } from '@/types/models';

interface ModelInfo {
  id: ModelType;
  name: string;
  version: string;
  whenToUse: string[];
  pros: string[];
  cons: string[];
  processingTime: string;
  costPerGeneration: number;
  qualityRating: number;
  bestFor: string[];
  technicalDetails: {
    resolution: string;
    steps: string;
    guidance: string;
    features: string[];
  };
  sampleImages?: {
    before: string;
    after: string;
    caption: string;
  }[];
}

const modelInfoData: Record<ModelType, ModelInfo> = {
  'canny-pro': {
    id: 'canny-pro',
    name: 'FLUX Canny Pro',
    version: '3e03126bd3fbb9349783930f4139eb6c488aef2197c4d3fd2a826b35ccecea3d',
    whenToUse: [
      'When you need to maintain exact structure and proportions',
      'For kitchen redesigns that keep cabinet layouts',
      'When preserving architectural elements is critical',
      'For subtle style changes without altering form'
    ],
    pros: [
      'Preserves exact structure and edges',
      'Maintains original proportions perfectly',
      'Ideal for realistic transformations',
      'Consistent and predictable results'
    ],
    cons: [
      'Less creative freedom',
      'Cannot change fundamental layout',
      'May struggle with heavily damaged images',
      'Structure constraints limit dramatic changes'
    ],
    processingTime: '15-20 seconds',
    costPerGeneration: 0.05,
    qualityRating: 4.8,
    bestFor: [
      'Kitchen makeovers',
      'Material changes',
      'Color transformations',
      'Style updates'
    ],
    technicalDetails: {
      resolution: '1344x768 (16:9)',
      steps: '50',
      guidance: '30',
      features: [
        'Edge detection',
        'Structure preservation',
        'High fidelity output',
        'Consistent lighting'
      ]
    }
  },
  'flux-pro': {
    id: 'flux-pro',
    name: 'FLUX 1.1 Pro',
    version: '80a09d66baa990429c2f5ae8a4306bf778a1b3775afd01cc2cc8bdbe9033769c',
    whenToUse: [
      'When you want creative freedom',
      'For dramatic kitchen transformations',
      'When exploring new layout possibilities',
      'For concept visualization'
    ],
    pros: [
      'Maximum creative flexibility',
      'Can generate entirely new layouts',
      'Excellent for brainstorming',
      'State-of-the-art quality'
    ],
    cons: [
      'May not preserve original structure',
      'Less predictable results',
      'Requires more prompt engineering',
      'Can diverge from source significantly'
    ],
    processingTime: '10-15 seconds',
    costPerGeneration: 0.04,
    qualityRating: 4.9,
    bestFor: [
      'Concept design',
      'Creative exploration',
      'New kitchen ideas',
      'Complete redesigns'
    ],
    technicalDetails: {
      resolution: '1344x768 (16:9)',
      steps: 'Adaptive',
      guidance: 'Variable',
      features: [
        'Creative generation',
        'Advanced AI understanding',
        'High quality outputs',
        'Flexible interpretation'
      ]
    }
  }
};

interface ModelInfoCardProps {
  modelType: ModelType;
  onClose?: () => void;
  className?: string;
}

export default function ModelInfoCard({ 
  modelType, 
  onClose,
  className = '' 
}: ModelInfoCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const info = modelInfoData[modelType];

  if (!info) return null;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`w-4 h-4 ${
              i < fullStars
                ? 'text-yellow-400'
                : i === fullStars && hasHalfStar
                ? 'text-yellow-400/50'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{info.name}</h3>
            <p className="text-xs text-gray-500 mt-1">Version: {info.version.slice(0, 8)}...</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
            <ClockIcon className="w-4 h-4" />
            <span className="text-xs">Processing</span>
          </div>
          <p className="text-sm font-medium">{info.processingTime}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
            <CurrencyDollarIcon className="w-4 h-4" />
            <span className="text-xs">Cost</span>
          </div>
          <p className="text-sm font-medium">${info.costPerGeneration.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
            <SparklesIcon className="w-4 h-4" />
            <span className="text-xs">Quality</span>
          </div>
          {renderStars(info.qualityRating)}
        </div>
      </div>

      {/* When to Use */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">When to use this model:</h4>
        <ul className="space-y-2">
          {info.whenToUse.map((use, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{use}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Best For Tags */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Best for:</h4>
        <div className="flex flex-wrap gap-2">
          {info.bestFor.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-[#C19A5B]/10 text-[#C19A5B] rounded-full text-sm font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Pros & Cons */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => toggleSection('proscons')}
          className="w-full flex items-center justify-between text-left"
        >
          <h4 className="font-medium text-gray-900">Pros & Cons</h4>
          {expandedSection === 'proscons' ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {expandedSection === 'proscons' && (
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-green-600 mb-2">Pros</h5>
              <ul className="space-y-2">
                {info.pros.map((pro, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-red-600 mb-2">Cons</h5>
              <ul className="space-y-2">
                {info.cons.map((con, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <XMarkIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Technical Details */}
      <div className="p-4">
        <button
          onClick={() => toggleSection('technical')}
          className="w-full flex items-center justify-between text-left"
        >
          <h4 className="font-medium text-gray-900">Technical Details</h4>
          {expandedSection === 'technical' ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {expandedSection === 'technical' && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Resolution:</span>
                <p className="font-medium">{info.technicalDetails.resolution}</p>
              </div>
              <div>
                <span className="text-gray-600">Steps:</span>
                <p className="font-medium">{info.technicalDetails.steps}</p>
              </div>
              <div>
                <span className="text-gray-600">Guidance:</span>
                <p className="font-medium">{info.technicalDetails.guidance}</p>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Features:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {info.technicalDetails.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}