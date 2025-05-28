'use client';

import React, { useMemo } from 'react';
import { Calculator, DollarSign, Clock, Zap } from 'lucide-react';
import { MODEL_CONFIGS } from '@/constants/models';
import { ScenarioType } from './ScenarioSelector';

interface CostEstimatorProps {
  scenario: ScenarioType;
  selectedModel: string;
  referenceCount?: number;
  isProcessing?: boolean;
  className?: string;
}

interface CostBreakdown {
  baseCost: number;
  additionalCosts: number;
  totalCost: number;
  estimatedTime: number;
  description: string;
}

export function CostEstimator({ 
  scenario, 
  selectedModel, 
  referenceCount = 1,
  isProcessing = false,
  className = '' 
}: CostEstimatorProps) {
  
  const calculateCost = useMemo((): CostBreakdown => {
    const modelConfig = MODEL_CONFIGS[selectedModel as keyof typeof MODEL_CONFIGS];
    if (!modelConfig) {
      return {
        baseCost: 0,
        additionalCosts: 0,
        totalCost: 0,
        estimatedTime: 0,
        description: 'Unknown model'
      };
    }

    let baseCost = modelConfig.costPerRun || 0;
    let additionalCosts = 0;
    let estimatedTime = modelConfig.averageTime || 15;
    let description = '';

    switch (scenario) {
      case 'style-transfer':
        description = 'Single generation with style reference';
        // No additional costs for style transfer
        break;
        
      case 'empty-room':
        description = 'Perspective-aware room generation';
        // Slightly longer processing for depth analysis
        estimatedTime = Math.round(estimatedTime * 1.2);
        break;
        
      case 'multi-reference':
        // Each additional reference adds cost
        const additionalRefs = Math.max(0, referenceCount - 1);
        additionalCosts = baseCost * additionalRefs;
        estimatedTime = estimatedTime * referenceCount;
        description = `Sequential processing of ${referenceCount} references`;
        break;
    }

    return {
      baseCost,
      additionalCosts,
      totalCost: baseCost + additionalCosts,
      estimatedTime,
      description
    };
  }, [scenario, selectedModel, referenceCount]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const { baseCost, additionalCosts, totalCost, estimatedTime, description } = calculateCost;

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-medium text-gray-900">Cost Estimation</h3>
      </div>

      <div className="space-y-3">
        {/* Cost Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Base cost:</span>
            <span className="font-medium text-gray-900">${baseCost.toFixed(3)}</span>
          </div>
          
          {additionalCosts > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Additional references:</span>
              <span className="font-medium text-gray-900">+${additionalCosts.toFixed(3)}</span>
            </div>
          )}
          
          <div className="border-t pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-unoform-gold" />
                <span className="text-sm font-medium text-gray-900">Total cost:</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                ${totalCost.toFixed(3)}
              </span>
            </div>
          </div>
        </div>

        {/* Time Estimate */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">Estimated time:</span>
          </div>
          <span className="font-medium text-gray-900">~{formatTime(estimatedTime)}</span>
        </div>

        {/* Description */}
        <div className="text-xs text-gray-500 italic">
          {description}
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Zap className="h-4 w-4 text-unoform-gold animate-pulse" />
            <span className="text-sm text-gray-600">Processing in progress...</span>
          </div>
        )}
      </div>

      {/* Cost Savings Tip */}
      {scenario === 'multi-reference' && referenceCount > 2 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <p className="text-yellow-800">
            <span className="font-medium">Tip:</span> Consider using fewer references or the Interior Design model for better value.
          </p>
        </div>
      )}
    </div>
  );
}