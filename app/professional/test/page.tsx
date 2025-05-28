'use client';

import React from 'react';
import { StyleTransferTest } from '@/components/professional/StyleTransferTest';
import Link from 'next/link';
import { ArrowLeft, Beaker } from 'lucide-react';

export default function ProfessionalTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/professional"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Professional UI</span>
              </Link>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div className="flex items-center gap-2">
                <Beaker className="h-5 w-5 text-unoform-gold" />
                <h1 className="text-lg font-semibold text-gray-900">Professional Testing Suite</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Development Mode
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="py-8">
        <StyleTransferTest />
      </main>
    </div>
  );
}