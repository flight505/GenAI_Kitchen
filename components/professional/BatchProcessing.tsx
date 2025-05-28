'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileImage, 
  Trash2, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Loader2,
  X,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/utils/cn';

interface BatchItem {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: string;
  error?: string;
  processingTime?: number;
}

interface BatchProcessingProps {
  styleReference?: string;
  prompt: string;
  parameters: Record<string, any>;
  onComplete?: (results: Array<{ id: string; result: string }>) => void;
  setToast: (toast: { message: string; type: 'success' | 'error' }) => void;
}

export default function BatchProcessing({ 
  styleReference, 
  prompt, 
  parameters,
  onComplete,
  setToast 
}: BatchProcessingProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingRef = useRef<boolean>(false);

  // Handle file selection
  const handleFiles = (fileList: FileList) => {
    const newItems = Array.from(fileList)
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        status: 'pending' as const,
        progress: 0
      }));
    
    setItems(prev => [...prev, ...newItems]);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Remove item from queue
  const removeItem = (id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  // Process single item
  const processItem = async (item: BatchItem) => {
    if (!processingRef.current || isPaused) return;

    const startTime = Date.now();
    
    // Update status to processing
    setItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, status: 'processing', progress: 10 } : i
    ));

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(item.file);
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        if (!processingRef.current || isPaused) {
          clearInterval(progressInterval);
          return;
        }
        
        setItems(prev => prev.map(i => 
          i.id === item.id && i.status === 'processing' 
            ? { ...i, progress: Math.min(i.progress + 10, 90) } 
            : i
        ));
      }, 500);

      // Call style transfer API
      const response = await fetch('/api/style-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceImage: base64,
          referenceImage: styleReference,
          prompt,
          parameters,
          scenario: 'style-transfer'
        })
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Processing failed');
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      // Update item with result
      setItems(prev => prev.map(i => 
        i.id === item.id 
          ? { 
              ...i, 
              status: 'completed', 
              progress: 100, 
              result: data.output,
              processingTime 
            } 
          : i
      ));

    } catch (error) {
      // Handle error
      setItems(prev => prev.map(i => 
        i.id === item.id 
          ? { 
              ...i, 
              status: 'error', 
              progress: 0, 
              error: error instanceof Error ? error.message : 'Processing failed' 
            } 
          : i
      ));
    }
  };

  // Start batch processing
  const startProcessing = async () => {
    if (items.length === 0 || !styleReference) {
      setToast({
        message: 'Please add images and select a style reference',
        type: 'error'
      });
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    processingRef.current = true;

    // Process items sequentially
    const pendingItems = items.filter(item => item.status === 'pending');
    
    for (const item of pendingItems) {
      if (!processingRef.current || isPaused) break;
      await processItem(item);
    }

    setIsProcessing(false);
    processingRef.current = false;

    // Notify completion
    const completedItems = items.filter(item => item.status === 'completed');
    if (completedItems.length > 0) {
      setToast({
        message: `Successfully processed ${completedItems.length} images`,
        type: 'success'
      });
      
      if (onComplete) {
        onComplete(completedItems.map(item => ({
          id: item.id,
          result: item.result!
        })));
      }
    }
  };

  // Pause/resume processing
  const togglePause = () => {
    setIsPaused(!isPaused);
    if (isPaused && !isProcessing) {
      startProcessing();
    }
  };

  // Stop processing
  const stopProcessing = () => {
    processingRef.current = false;
    setIsProcessing(false);
    setIsPaused(false);
  };

  // Clear completed items
  const clearCompleted = () => {
    setItems(prev => {
      // Clean up object URLs
      prev.filter(item => item.status === 'completed').forEach(item => {
        if (item.preview) URL.revokeObjectURL(item.preview);
      });
      return prev.filter(item => item.status !== 'completed');
    });
  };

  // Calculate statistics
  const stats = {
    total: items.length,
    pending: items.filter(i => i.status === 'pending').length,
    processing: items.filter(i => i.status === 'processing').length,
    completed: items.filter(i => i.status === 'completed').length,
    errors: items.filter(i => i.status === 'error').length
  };

  const formatTime = (ms?: number) => {
    if (!ms) return '—';
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all",
          isDragging ? "border-unoform-gold bg-unoform-gold/5" : "border-gray-300",
          "hover:border-gray-400 cursor-pointer"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {isDragging ? 'Drop images here' : 'Upload customer images'}
        </h3>
        <p className="text-sm text-gray-500">
          Drag & drop multiple images or click to browse
        </p>
        {styleReference && (
          <p className="text-sm text-unoform-gold mt-2">
            <Sparkles className="inline-block w-4 h-4 mr-1" />
            Style reference selected
          </p>
        )}
      </div>

      {/* Queue Stats */}
      {items.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              <span>Pending: {stats.pending}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span>Processing: {stats.processing}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Completed: {stats.completed}</span>
            </div>
            {stats.errors > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span>Errors: {stats.errors}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {stats.completed > 0 && (
              <button
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={clearCompleted}
              >
                Clear Completed
              </button>
            )}
            {isProcessing ? (
              <>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={togglePause}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  className="px-3 py-1.5 text-sm text-white bg-red-500 rounded-md hover:bg-red-600"
                  onClick={stopProcessing}
                >
                  Stop
                </button>
              </>
            ) : (
              <button
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-unoform-gold rounded-md hover:bg-unoform-gold-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={startProcessing}
                disabled={stats.pending === 0}
              >
                <Play className="h-4 w-4" />
                Start Processing
              </button>
            )}
          </div>
        </div>
      )}

      {/* Queue Items */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm"
            >
              {/* Thumbnail */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={item.preview}
                  alt={item.file.name}
                  fill
                  className="object-cover rounded"
                />
                {item.status === 'completed' && item.result && (
                  <div className="absolute inset-0 bg-black/50 rounded opacity-0 hover:opacity-100 transition-opacity">
                    <Image
                      src={item.result}
                      alt="Result"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileImage className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium truncate">
                    {item.file.name}
                  </span>
                </div>
                
                {/* Status */}
                <div className="flex items-center gap-2 text-sm">
                  {item.status === 'pending' && (
                    <>
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Waiting in queue</span>
                    </>
                  )}
                  {item.status === 'processing' && (
                    <>
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                      <span className="text-blue-600">Processing... {item.progress}%</span>
                    </>
                  )}
                  {item.status === 'completed' && (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">
                        Completed in {formatTime(item.processingTime)}
                      </span>
                    </>
                  )}
                  {item.status === 'error' && (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">{item.error}</span>
                    </>
                  )}
                </div>

                {/* Progress Bar */}
                {item.status === 'processing' && (
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {item.status === 'completed' && item.result && (
                  <button
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = item.result!;
                      link.download = `styled-${item.file.name}`;
                      link.click();
                    }}
                  >
                    Download
                  </button>
                )}
                <button
                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => removeItem(item.id)}
                  disabled={item.status === 'processing'}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}