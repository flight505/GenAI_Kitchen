'use client';

import React from 'react';
import { Sparkles, Home, Layers, FileStack } from 'lucide-react';

export type ScenarioType = 'style-transfer' | 'empty-room' | 'multi-reference' | 'batch-processing';

interface ScenarioSelectorProps {
  activeScenario: ScenarioType;
  onChange: (scenario: ScenarioType) => void;
}

const scenarios = [
  {
    id: 'style-transfer' as ScenarioType,
    name: 'Style Transfer',
    icon: Sparkles,
    description: 'Apply showroom styles to customer kitchens'
  },
  {
    id: 'empty-room' as ScenarioType,
    name: 'Empty Room',
    icon: Home,
    description: 'Visualize kitchens in empty spaces'
  },
  {
    id: 'multi-reference' as ScenarioType,
    name: 'Multi-Reference',
    icon: Layers,
    description: 'Combine elements from multiple designs'
  },
  {
    id: 'batch-processing' as ScenarioType,
    name: 'Batch Processing',
    icon: FileStack,
    description: 'Process multiple customer images with the same style'
  }
];

export function ScenarioSelector({ activeScenario, onChange }: ScenarioSelectorProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="px-6">
        <nav className="flex gap-2" aria-label="Scenarios">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            const isActive = activeScenario === scenario.id;
            
            return (
              <button
                key={scenario.id}
                onClick={() => onChange(scenario.id)}
                className={`
                  relative rounded-none py-3 px-6 text-sm font-medium transition-all
                  after:absolute after:inset-x-0 after:bottom-0 after:-mb-px after:h-0.5
                  hover:bg-gray-50 hover:text-gray-900
                  ${isActive 
                    ? 'text-gray-900 after:bg-unoform-gold' 
                    : 'text-gray-500 after:bg-transparent'
                  }
                `}
                title={scenario.description}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{scenario.name}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}