'use client';

import { ProfessionalInterfaceV2 } from '@/components/professional/ProfessionalInterfaceV2';
import { useState } from 'react';
import { Sparkles, Home, Layers } from 'lucide-react';

export default function ProfessionalPage() {
  const [scenario, setScenario] = useState<string>('style-transfer');

  const scenarios = [
    { id: 'style-transfer' as const, name: 'Style Transfer', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'empty-room' as const, name: 'Empty Room', icon: <Home className="h-4 w-4" /> },
    { id: 'multi-reference' as const, name: 'Multi-Reference', icon: <Layers className="h-4 w-4" /> }
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-3">
              <div className="h-8 w-8 bg-unoform-gold rounded" />
              <span className="text-lg font-medium">GenAI Kitchen Pro</span>
            </a>
            
            {/* Scenario Tabs */}
            <div className="flex items-center gap-1">
              {scenarios.map(s => (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
                    ${scenario === s.id 
                      ? 'bg-unoform-gold text-white' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  {s.icon}
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="/saved" className="text-sm text-gray-600 hover:text-gray-900">Saved</a>
            <a href="/dream" className="text-sm text-gray-600 hover:text-gray-900">Simple Mode</a>
            <span className="text-sm text-gray-600">demo_user</span>
            <div className="h-8 w-8 rounded-full bg-gray-200" />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ProfessionalInterfaceV2 />
      </main>
    </div>
  );
}