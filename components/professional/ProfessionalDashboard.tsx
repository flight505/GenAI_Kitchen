'use client';

import React from 'react';
import { ProfessionalWorkflow } from './ProfessionalWorkflow';
import { ScenarioType } from '@/types/models';
import { 
  LayoutDashboard, 
  Sparkles, 
  Home, 
  Layers,
  Settings,
  BarChart3,
  FolderOpen,
  Users,
  HelpCircle
} from 'lucide-react';

interface DashboardProps {
  initialScenario?: ScenarioType;
}

export function ProfessionalDashboard({ initialScenario = 'style-transfer' }: DashboardProps) {
  const [activeScenario, setActiveScenario] = React.useState<ScenarioType>(initialScenario);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const scenarios = [
    { 
      id: 'style-transfer' as const, 
      name: 'Style Transfer', 
      icon: Sparkles,
      description: 'Apply reference styles to target images'
    },
    { 
      id: 'empty-room' as const, 
      name: 'Empty Room', 
      icon: Home,
      description: 'Visualize kitchens in empty spaces'
    },
    { 
      id: 'multi-reference' as const, 
      name: 'Multi-Reference', 
      icon: Layers,
      description: 'Combine multiple design references'
    }
  ];

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: FolderOpen, label: 'Projects', badge: '12' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: Users, label: 'Team' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Professional Sidebar */}
      <aside className={`
        bg-gray-900 border-r border-gray-800 transition-all duration-300
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
                <span className="font-bold text-lg">GenAI Pro</span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M3 3H13M3 13H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            <div className="px-3 mb-4">
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Navigation
                </h3>
              )}
              <ul className="space-y-1">
                {navigationItems.map((item, idx) => (
                  <li key={idx}>
                    <button className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                      ${item.active 
                        ? 'bg-gray-800 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }
                    `}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Scenarios */}
            <div className="px-3 mt-6">
              {!sidebarCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Workflows
                </h3>
              )}
              <ul className="space-y-1">
                {scenarios.map((scenario) => (
                  <li key={scenario.id}>
                    <button
                      onClick={() => setActiveScenario(scenario.id)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                        ${activeScenario === scenario.id
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }
                      `}
                      title={sidebarCollapsed ? scenario.name : undefined}
                    >
                      <scenario.icon className="h-5 w-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <div className="flex-1 text-left">
                          <div className="font-medium">{scenario.name}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">
                            {scenario.description}
                          </div>
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition-all">
              <HelpCircle className="h-5 w-5" />
              {!sidebarCollapsed && <span>Help & Support</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ProfessionalWorkflow scenario={activeScenario} />
      </main>
    </div>
  );
}