'use client';

import React from 'react';
import { Sparkles, Home, Layers } from 'lucide-react';

export type ScenarioType = 'style-transfer' | 'empty-room' | 'multi-reference';

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
  }
];

export function ScenarioSelector({ activeScenario, onChange }: ScenarioSelectorProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="px-6">
        <nav className="flex space-x-8" aria-label="Scenarios">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            const isActive = activeScenario === scenario.id;
            
            return (
              <button
                key={scenario.id}
                onClick={() => onChange(scenario.id)}
                className={`
                  relative py-4 px-1 border-b-2 font-medium text-sm transition-all
                  ${isActive 
                    ? 'border-unoform-gold text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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