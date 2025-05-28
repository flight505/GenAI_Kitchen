'use client';

import { ProfessionalInterfaceV2 } from '@/components/professional/ProfessionalInterfaceV2';

export default function ProfessionalPage() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3">
              <div className="h-8 w-8 bg-unoform-gold rounded" />
              <span className="text-lg font-medium">GenAI Kitchen Pro</span>
            </a>
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