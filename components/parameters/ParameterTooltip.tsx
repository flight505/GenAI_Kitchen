'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  QuestionMarkCircleIcon,
  PlayIcon,
  AcademicCapIcon,
  LightBulbIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface TooltipContent {
  title: string;
  description: string;
  example?: string;
  tips?: string[];
  warnings?: string[];
  visualExample?: {
    low: string;
    medium: string;
    high: string;
  };
  learnMoreUrl?: string;
}

const parameterTooltips: Record<string, TooltipContent> = {
  guidance: {
    title: 'Guidance Scale',
    description: 'Controls how closely the AI follows your text prompt. Higher values make the AI stick more literally to your description.',
    example: 'At guidance 5: Creative interpretation. At guidance 30: Strict adherence to prompt.',
    tips: [
      'Use lower values (5-15) for more artistic freedom',
      'Use higher values (20-30) for precise control',
      'Start with 15-20 for balanced results'
    ],
    warnings: [
      'Very high values (>40) may cause oversaturation',
      'Very low values (<5) may ignore important details'
    ],
    visualExample: {
      low: '🎨 Creative',
      medium: '⚖️ Balanced',
      high: '📐 Precise'
    }
  },
  steps: {
    title: 'Inference Steps',
    description: 'The number of refinement iterations the AI performs. More steps generally mean higher quality but take longer.',
    example: '20 steps: Quick preview. 50 steps: High quality. 100 steps: Maximum detail.',
    tips: [
      'Use 20-30 steps for quick iterations',
      'Use 40-50 steps for final renders',
      'Diminishing returns after 60 steps'
    ],
    warnings: [
      'More steps = longer generation time',
      'Not all models benefit equally from more steps'
    ],
    visualExample: {
      low: '⚡ Fast',
      medium: '🎯 Quality',
      high: '💎 Premium'
    }
  },
  strength: {
    title: 'Structure Strength',
    description: 'How much of the original image structure to preserve. Lower values allow more creative changes.',
    example: '0.3: Major changes allowed. 0.8: Preserve most structure. 0.95: Minimal changes.',
    tips: [
      'Use 0.7-0.9 for kitchen redesigns',
      'Use 0.3-0.5 for dramatic transformations',
      'Start with 0.8 for predictable results'
    ],
    warnings: [
      'Values below 0.3 may lose important features',
      'Values above 0.95 may prevent desired changes'
    ],
    visualExample: {
      low: '🔄 Transform',
      medium: '🏗️ Redesign',
      high: '🔒 Preserve'
    }
  },
  safety_tolerance: {
    title: 'Safety Tolerance',
    description: 'Content filtering level. Higher values are more permissive of architectural and design variations.',
    example: 'Level 1: Strict filtering. Level 3: Balanced. Level 5: Most permissive.',
    tips: [
      'Use level 2-3 for most kitchen designs',
      'Higher levels allow more creative freedom',
      'Lower levels ensure family-friendly results'
    ],
    learnMoreUrl: 'https://replicate.com/docs/safety'
  }
};

interface ParameterTooltipProps {
  parameter: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function ParameterTooltip({
  parameter,
  children,
  position = 'top',
  className = ''
}: ParameterTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const content = parameterTooltips[parameter];
  if (!content) return <>{children}</>;

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let x = 0;
      let y = 0;

      switch (position) {
        case 'top':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          y = triggerRect.top - tooltipRect.height - 8;
          break;
        case 'bottom':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          y = triggerRect.bottom + 8;
          break;
        case 'left':
          x = triggerRect.left - tooltipRect.width - 8;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          break;
        case 'right':
          x = triggerRect.right + 8;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          break;
      }

      // Keep tooltip within viewport
      x = Math.max(8, Math.min(window.innerWidth - tooltipRect.width - 8, x));
      y = Math.max(8, Math.min(window.innerHeight - tooltipRect.height - 8, y));

      setTooltipPosition({ x, y });
    }
  }, [isVisible, position]);

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-flex items-center ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children || (
          <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
        )}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 w-80 p-4 bg-white rounded-lg shadow-xl border border-gray-200"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`
          }}
        >
          {/* Header */}
          <div className="mb-3">
            <h4 className="text-base font-semibold text-gray-900">{content.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{content.description}</p>
          </div>

          {/* Example */}
          {content.example && (
            <div className="mb-3 p-3 bg-gray-50 rounded">
              <div className="flex items-start gap-2">
                <PlayIcon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-700">{content.example}</p>
              </div>
            </div>
          )}

          {/* Visual Example */}
          {content.visualExample && (
            <div className="mb-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-gray-100 rounded">
                  <div className="text-xl mb-1">{content.visualExample.low}</div>
                  <div className="text-xs text-gray-600">Low</div>
                </div>
                <div className="p-2 bg-gray-100 rounded">
                  <div className="text-xl mb-1">{content.visualExample.medium}</div>
                  <div className="text-xs text-gray-600">Medium</div>
                </div>
                <div className="p-2 bg-gray-100 rounded">
                  <div className="text-xl mb-1">{content.visualExample.high}</div>
                  <div className="text-xs text-gray-600">High</div>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          {content.tips && content.tips.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1 mb-2">
                <LightBulbIcon className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900">Tips</span>
              </div>
              <ul className="space-y-1">
                {content.tips.map((tip, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-gray-400">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {content.warnings && content.warnings.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1 mb-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-900">Warnings</span>
              </div>
              <ul className="space-y-1">
                {content.warnings.map((warning, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-gray-400">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Learn More */}
          {content.learnMoreUrl && (
            <div className="pt-3 border-t border-gray-200">
              <a
                href={content.learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#C19A5B] hover:text-[#C19A5B]/80"
              >
                <AcademicCapIcon className="w-4 h-4" />
                Learn more
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Beginner Mode Component
export function BeginnerModeToggle({
  isBeginnerMode,
  onToggle
}: {
  isBeginnerMode: boolean;
  onToggle: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <AcademicCapIcon className="w-5 h-5 text-blue-600" />
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">Beginner Mode</h4>
        <p className="text-xs text-gray-600">Show helpful tips and simplified controls</p>
      </div>
      <button
        onClick={() => onToggle(!isBeginnerMode)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
          isBeginnerMode ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            isBeginnerMode ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}