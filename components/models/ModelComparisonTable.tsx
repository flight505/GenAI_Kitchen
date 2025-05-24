'use client';

import React from 'react';
import { CheckIcon, XMarkIcon, MinusIcon } from '@heroicons/react/24/outline';
import { ModelType } from '@/types/models';

interface ComparisonRow {
  feature: string;
  category: string;
  cannyPro: string | boolean;
  fluxPro: string | boolean;
  tooltip?: string;
}

const comparisonData: ComparisonRow[] = [
  // General
  {
    feature: 'Structure Preservation',
    category: 'General',
    cannyPro: true,
    fluxPro: false,
    tooltip: 'Ability to maintain original image structure and proportions'
  },
  {
    feature: 'Creative Freedom',
    category: 'General',
    cannyPro: false,
    fluxPro: true,
    tooltip: 'Flexibility to generate completely new designs'
  },
  {
    feature: 'Processing Speed',
    category: 'General',
    cannyPro: '15-20s',
    fluxPro: '10-15s'
  },
  {
    feature: 'Cost per Generation',
    category: 'General',
    cannyPro: '$0.05',
    fluxPro: '$0.04'
  },
  
  // Use Cases
  {
    feature: 'Kitchen Makeovers',
    category: 'Use Cases',
    cannyPro: true,
    fluxPro: 'partial',
    tooltip: 'Updating existing kitchen designs while keeping layout'
  },
  {
    feature: 'Complete Redesigns',
    category: 'Use Cases',
    cannyPro: false,
    fluxPro: true,
    tooltip: 'Creating entirely new kitchen concepts'
  },
  {
    feature: 'Material Changes',
    category: 'Use Cases',
    cannyPro: true,
    fluxPro: true
  },
  {
    feature: 'Layout Changes',
    category: 'Use Cases',
    cannyPro: false,
    fluxPro: true
  },
  
  // Technical
  {
    feature: 'Edge Detection',
    category: 'Technical',
    cannyPro: true,
    fluxPro: false
  },
  {
    feature: 'Predictable Results',
    category: 'Technical',
    cannyPro: true,
    fluxPro: 'partial'
  },
  {
    feature: 'Prompt Flexibility',
    category: 'Technical',
    cannyPro: 'partial',
    fluxPro: true
  },
  {
    feature: 'Batch Processing',
    category: 'Technical',
    cannyPro: true,
    fluxPro: true
  }
];

interface ModelComparisonTableProps {
  className?: string;
}

export default function ModelComparisonTable({ className = '' }: ModelComparisonTableProps) {
  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckIcon className="w-5 h-5 text-green-500" />
      ) : (
        <XMarkIcon className="w-5 h-5 text-red-500" />
      );
    }
    
    if (value === 'partial') {
      return <MinusIcon className="w-5 h-5 text-yellow-500" />;
    }
    
    return <span className="text-sm font-medium">{value}</span>;
  };

  const categories = Array.from(new Set(comparisonData.map(row => row.category)));

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Model Comparison</h3>
        <p className="text-sm text-gray-600 mt-1">
          Compare features and capabilities between models
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feature
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                FLUX Canny Pro
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                FLUX 1.1 Pro
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <React.Fragment key={category}>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-6 py-2 text-sm font-medium text-gray-700">
                    {category}
                  </td>
                </tr>
                {comparisonData
                  .filter(row => row.category === category)
                  .map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900">{row.feature}</span>
                          {row.tooltip && (
                            <div className="group relative">
                              <svg
                                className="w-4 h-4 text-gray-400 cursor-help"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <div className="absolute z-10 hidden group-hover:block w-64 p-2 mt-1 text-xs text-white bg-gray-800 rounded-lg shadow-lg -left-28">
                                {row.tooltip}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center">
                          {renderValue(row.cannyPro)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center">
                          {renderValue(row.fluxPro)}
                        </div>
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-green-500" />
            <span>Supported</span>
          </div>
          <div className="flex items-center gap-2">
            <MinusIcon className="w-4 h-4 text-yellow-500" />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <XMarkIcon className="w-4 h-4 text-red-500" />
            <span>Not supported</span>
          </div>
        </div>
      </div>
    </div>
  );
}