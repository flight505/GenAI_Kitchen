'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Upload, ArrowRight, Sparkles, Palette, Package, Loader2 } from 'lucide-react';
import { UploadDropzone } from '@bytescale/upload-widget-react';
import LoadingDots from '@/components/LoadingDots';

interface StyleTransferPanelProps {
  targetImage: string;
  onTransferComplete?: (resultImage: string, metadata: any) => void;
}

type TransferMode = 'style' | 'element' | 'material';

const transferModeConfig = {
  style: {
    icon: Sparkles,
    label: 'Complete Style',
    description: 'Transfer overall aesthetic, colors, and atmosphere',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  element: {
    icon: Package,
    label: 'Design Elements',
    description: 'Transfer specific fixtures, hardware, and components',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  material: {
    icon: Palette,
    label: 'Materials & Finishes',
    description: 'Transfer textures, materials, and surface finishes',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  }
};

export default function StyleTransferPanel({ targetImage, onTransferComplete }: StyleTransferPanelProps) {
  const [referenceImage, setReferenceImage] = useState<string>('');
  const [transferMode, setTransferMode] = useState<TransferMode>('style');
  const [transferIntensity, setTransferIntensity] = useState(0.7);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleReferenceUpload = useCallback((files: any[]) => {
    if (files && files.length > 0) {
      setReferenceImage(files[0].fileUrl);
      setError('');
    }
  }, []);

  const handleStyleTransfer = async () => {
    if (!referenceImage) {
      setError('Please upload a reference image');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/style-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referenceImage,
          targetImage,
          transferMode,
          transferIntensity,
          prompt: customPrompt,
          aspectRatio: '16:9'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Style transfer failed');
      }

      if (onTransferComplete) {
        onTransferComplete(data.outputUrl, data.metadata);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Style transfer failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Style Transfer</h2>
        <p className="text-gray-600">
          Upload a reference image to transfer its style to your kitchen design
        </p>
      </div>

      {/* Reference Image Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Reference Image</h3>
        
        {!referenceImage ? (
          <UploadDropzone
            options={{
              apiKey: process.env.NEXT_PUBLIC_UPLOAD_API_KEY ?? '',
              maxFileCount: 1,
              acceptedFileTypes: ['image/*'],
              styles: {
                colors: {
                  primary: '#C19A5B',
                },
              },
            }}
            onUpdate={handleReferenceUpload}
          />
        ) : (
          <div className="relative group">
            <Image
              src={referenceImage}
              alt="Reference kitchen"
              width={400}
              height={225}
              className="rounded-lg border-2 border-gray-200 w-full"
            />
            <button
              onClick={() => setReferenceImage('')}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Transfer Mode Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Transfer Mode</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(transferModeConfig).map(([mode, config]) => {
            const Icon = config.icon;
            const isSelected = transferMode === mode;
            
            return (
              <button
                key={mode}
                onClick={() => setTransferMode(mode as TransferMode)}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${isSelected 
                    ? `${config.borderColor} ${config.bgColor}` 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`w-6 h-6 mb-2 ${isSelected ? config.color : 'text-gray-400'}`} />
                <div className="text-sm font-medium text-gray-900">{config.label}</div>
                <div className="text-xs text-gray-500 mt-1">{config.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transfer Intensity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Transfer Intensity</h3>
          <span className="text-sm text-gray-500">{Math.round(transferIntensity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={transferIntensity}
          onChange={(e) => setTransferIntensity(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C19A5B]"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Subtle</span>
          <span>Balanced</span>
          <span>Strong</span>
        </div>
      </div>

      {/* Custom Prompt */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Additional Instructions (Optional)</h3>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Add specific instructions for the style transfer..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C19A5B] focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleStyleTransfer}
        disabled={!referenceImage || isProcessing}
        className={`
          w-full py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-3
          ${!referenceImage || isProcessing
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-[#C19A5B] text-white hover:bg-[#A88A4B] shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing Style Transfer...</span>
          </>
        ) : (
          <>
            <span>Apply Style Transfer</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      {/* Preview */}
      {referenceImage && targetImage && (
        <div className="bg-gray-50 p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Transfer Preview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Reference Style</p>
              <Image
                src={referenceImage}
                alt="Reference"
                width={300}
                height={169}
                className="rounded-lg border border-gray-200 w-full"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Your Kitchen</p>
              <Image
                src={targetImage}
                alt="Target"
                width={300}
                height={169}
                className="rounded-lg border border-gray-200 w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}