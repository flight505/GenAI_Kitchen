'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

const showcaseExamples = [
  {
    id: 'showroom-to-home',
    title: 'Showroom to Your Kitchen',
    description: 'Apply the exact style from our showroom to your existing kitchen layout',
    reference: '/images/showcase/showroom-classic.jpg',
    target: '/images/showcase/customer-kitchen.jpg',
    result: '/images/showcase/styled-kitchen.jpg',
    mode: 'style'
  },
  {
    id: 'material-transfer',
    title: 'Premium Material Transfer',
    description: 'Transfer Unoform signature materials and finishes to your design',
    reference: '/images/showcase/material-reference.jpg',
    target: '/images/showcase/basic-kitchen.jpg',
    result: '/images/showcase/material-upgraded.jpg',
    mode: 'material'
  },
  {
    id: 'element-upgrade',
    title: 'Design Element Upgrade',
    description: 'Upgrade specific elements like cabinets and hardware from our catalog',
    reference: '/images/showcase/element-catalog.jpg',
    target: '/images/showcase/old-kitchen.jpg',
    result: '/images/showcase/element-upgraded.jpg',
    mode: 'element'
  }
];

export default function StyleTransferShowcase() {
  return (
    <div className="w-full py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">New Feature</span>
          </div>
          <h2 className="text-3xl font-work font-medium text-gray-900 mb-4">
            Style Transfer Technology
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your kitchen with styles from our showroom, apply premium materials, 
            or upgrade specific design elements using advanced AI
          </p>
        </div>

        {/* Examples Grid */}
        <div className="space-y-16">
          {showcaseExamples.map((example, index) => (
            <div 
              key={example.id}
              className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 items-center`}
            >
              {/* Text Content */}
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-work font-medium text-gray-900">
                  {example.title}
                </h3>
                <p className="text-gray-600">
                  {example.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="px-3 py-1 bg-gray-100 rounded-full">
                    Transfer Mode: {example.mode}
                  </span>
                </div>
              </div>

              {/* Visual Demo */}
              <div className="flex-1">
                <div className="grid grid-cols-3 gap-4 items-center">
                  {/* Reference */}
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Reference</p>
                    <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden border-2 border-purple-200">
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Sparkles className="w-8 h-8" />
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <ArrowRight className="w-6 h-6 text-[#C19A5B]" />
                  </div>

                  {/* Result */}
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Result</p>
                    <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden border-2 border-[#C19A5B]">
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Sparkles className="w-8 h-8" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-2xl">
            <h3 className="text-xl font-work font-medium text-gray-900 mb-4">
              Ready to Transform Your Kitchen?
            </h3>
            <p className="text-gray-600 mb-6">
              Upload your kitchen photo and try our style transfer technology
            </p>
            <button 
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('tab', 'refine');
                window.history.pushState({}, '', url);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="inline-flex items-center gap-2 bg-[#C19A5B] text-white px-6 py-3 rounded-lg hover:bg-[#A88A4B] transition-colors"
            >
              <span>Try Style Transfer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}