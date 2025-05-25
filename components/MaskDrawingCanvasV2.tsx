'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PaintBrushIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  CursorArrowRippleIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import type { MaskToolSettings } from '@/types/inpainting';

interface MaskDrawingCanvasV2Props {
  imageUrl: string;
  width: number;
  height: number;
  onMaskComplete: (maskDataUrl: string) => void;
  settings?: MaskToolSettings;
  onSettingsChange?: (settings: Partial<MaskToolSettings>) => void;
}

interface MaskHistory {
  data: ImageData;
  timestamp: number;
}

export default function MaskDrawingCanvasV2({
  imageUrl,
  width,
  height,
  onMaskComplete,
  settings = {
    brushSize: 50,
    brushOpacity: 0.8,
    brushHardness: 0.8,
    eraseMode: false,
    showMaskOverlay: true,
    maskColor: '#ff0000',
    featherAmount: 2,
    quickSelectionMode: 'none'
  },
  onSettingsChange
}: MaskDrawingCanvasV2Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [history, setHistory] = useState<MaskHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [maskLibrary, setMaskLibrary] = useState<Array<{id: string; data: string; name: string}>>([]);
  const [previewMode, setPreviewMode] = useState<'overlay' | 'mask' | 'difference'>('overlay');

  // Initialize canvases
  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    
    if (!canvas || !maskCanvas || !previewCanvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    const previewCtx = previewCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx || !maskCtx || !previewCtx) return;

    // Load the image
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      maskCtx.clearRect(0, 0, width, height);
      updatePreview();
      saveToHistory();
    };
    img.src = imageUrl;
  }, [imageUrl, width, height]);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;
    
    const imageData = maskCtx.getImageData(0, 0, width, height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ data: imageData, timestamp: Date.now() });
    
    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, width, height]);

  // Undo/Redo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const maskCtx = maskCanvasRef.current?.getContext('2d');
      if (!maskCtx) return;
      
      const prevState = history[historyIndex - 1];
      maskCtx.putImageData(prevState.data, 0, 0);
      setHistoryIndex(historyIndex - 1);
      updatePreview();
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const maskCtx = maskCanvasRef.current?.getContext('2d');
      if (!maskCtx) return;
      
      const nextState = history[historyIndex + 1];
      maskCtx.putImageData(nextState.data, 0, 0);
      setHistoryIndex(historyIndex + 1);
      updatePreview();
    }
  }, [history, historyIndex]);

  // Update preview based on mode
  const updatePreview = useCallback(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    
    if (!canvas || !maskCanvas || !previewCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    const previewCtx = previewCanvas.getContext('2d');
    
    if (!ctx || !maskCtx || !previewCtx) return;
    
    previewCtx.clearRect(0, 0, width, height);
    
    if (!settings.showMaskOverlay) return;
    
    switch (previewMode) {
      case 'overlay':
        // Draw mask as colored overlay
        previewCtx.globalAlpha = 0.5;
        previewCtx.fillStyle = settings.maskColor;
        const maskData = maskCtx.getImageData(0, 0, width, height);
        for (let i = 0; i < maskData.data.length; i += 4) {
          if (maskData.data[i + 3] > 0) {
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);
            previewCtx.fillRect(x, y, 1, 1);
          }
        }
        break;
        
      case 'mask':
        // Show only the mask
        previewCtx.drawImage(maskCanvas, 0, 0);
        break;
        
      case 'difference':
        // Show difference between original and mask
        const origData = ctx.getImageData(0, 0, width, height);
        const diffData = maskCtx.getImageData(0, 0, width, height);
        const outputData = previewCtx.createImageData(width, height);
        
        for (let i = 0; i < origData.data.length; i += 4) {
          const alpha = diffData.data[i + 3];
          outputData.data[i] = alpha > 0 ? 255 : origData.data[i];
          outputData.data[i + 1] = alpha > 0 ? 0 : origData.data[i + 1];
          outputData.data[i + 2] = alpha > 0 ? 0 : origData.data[i + 2];
          outputData.data[i + 3] = 255;
        }
        
        previewCtx.putImageData(outputData, 0, 0);
        break;
    }
  }, [width, height, settings.showMaskOverlay, settings.maskColor, previewMode]);

  // Drawing functions
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (coords) {
      draw(coords.x, coords.y, true);
    }
  }, []);

  const draw = useCallback((x: number, y: number, isNewStroke: boolean = false) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;
    
    maskCtx.globalCompositeOperation = settings.eraseMode ? 'destination-out' : 'source-over';
    maskCtx.globalAlpha = settings.brushOpacity;
    
    // Apply feathering
    if (settings.featherAmount > 0) {
      maskCtx.filter = `blur(${settings.featherAmount}px)`;
    }
    
    // Draw with hardness gradient
    const gradient = maskCtx.createRadialGradient(x, y, 0, x, y, settings.brushSize / 2);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${settings.brushHardness})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    maskCtx.fillStyle = gradient;
    maskCtx.beginPath();
    maskCtx.arc(x, y, settings.brushSize / 2, 0, Math.PI * 2);
    maskCtx.fill();
    
    updatePreview();
  }, [settings, updatePreview]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  }, [isDrawing, saveToHistory]);

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    if (coords) {
      draw(coords.x, coords.y);
    }
  }, [isDrawing, draw]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  // Quick selection tools
  const applyQuickSelection = useCallback((mode: 'edges' | 'color') => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    if (!ctx || !maskCtx) return;
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const maskData = maskCtx.createImageData(width, height);
    
    if (mode === 'edges') {
      // Simple edge detection
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          const idxLeft = (y * width + (x - 1)) * 4;
          const idxRight = (y * width + (x + 1)) * 4;
          const idxTop = ((y - 1) * width + x) * 4;
          const idxBottom = ((y + 1) * width + x) * 4;
          
          const gx = Math.abs(imageData.data[idxLeft] - imageData.data[idxRight]);
          const gy = Math.abs(imageData.data[idxTop] - imageData.data[idxBottom]);
          const edge = Math.sqrt(gx * gx + gy * gy);
          
          if (edge > 30) {
            maskData.data[idx + 3] = 255;
          }
        }
      }
    }
    
    maskCtx.putImageData(maskData, 0, 0);
    updatePreview();
    saveToHistory();
  }, [width, height, updatePreview, saveToHistory]);

  // Export/Import masks
  const exportMask = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    const dataUrl = maskCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `mask-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  const importMask = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maskCtx = maskCanvasRef.current?.getContext('2d');
        if (!maskCtx) return;
        
        maskCtx.clearRect(0, 0, width, height);
        maskCtx.drawImage(img, 0, 0, width, height);
        updatePreview();
        saveToHistory();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [width, height, updatePreview, saveToHistory]);

  // Clear mask
  const clearMask = useCallback(() => {
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    if (!maskCtx) return;
    
    maskCtx.clearRect(0, 0, width, height);
    updatePreview();
    saveToHistory();
  }, [width, height, updatePreview, saveToHistory]);

  // Invert mask
  const invertMask = useCallback(() => {
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    if (!maskCtx) return;
    
    const imageData = maskCtx.getImageData(0, 0, width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 3] = 255 - imageData.data[i + 3];
    }
    maskCtx.putImageData(imageData, 0, 0);
    updatePreview();
    saveToHistory();
  }, [width, height, updatePreview, saveToHistory]);

  // Complete mask
  const completeMask = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    
    onMaskComplete(maskCanvas.toDataURL('image/png'));
  }, [onMaskComplete]);

  return (
    <div className="relative">
      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="relative bg-muted rounded-lg overflow-hidden"
        style={{ maxWidth: width, aspectRatio: `${width}/${height}` }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="absolute inset-0 w-full h-full"
        />
        <canvas
          ref={maskCanvasRef}
          width={width}
          height={height}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ mixBlendMode: 'multiply', opacity: 0.5 }}
        />
        <canvas
          ref={previewCanvasRef}
          width={width}
          height={height}
          className="absolute inset-0 w-full h-full"
          onMouseDown={startDrawing}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={handleMouseMove}
          onTouchEnd={stopDrawing}
          style={{ cursor: settings.eraseMode ? 'crosshair' : 'default' }}
        />
        
        {/* Brush preview */}
        {!isDrawing && (
          <div
            className="absolute pointer-events-none border-2 border-primary/50 rounded-full"
            style={{
              width: settings.brushSize,
              height: settings.brushSize,
              transform: 'translate(-50%, -50%)',
              // Position will be updated by mouse position
            }}
          />
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 space-y-4">
        {/* Main Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSettingsChange?.({ eraseMode: !settings.eraseMode })}
            className={`btn-outline flex items-center gap-2 ${
              settings.eraseMode ? 'bg-destructive/10 border-destructive' : ''
            }`}
          >
            <PaintBrushIcon className="w-4 h-4" />
            {settings.eraseMode ? 'Erase' : 'Draw'}
          </button>
          
          <button
            onClick={clearMask}
            className="btn-outline"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="btn-outline"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="btn-outline"
          >
            <ArrowUturnRightIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={invertMask}
            className="btn-outline"
          >
            <SwatchIcon className="w-4 h-4" />
          </button>
          
          <div className="flex-1" />
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-outline"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border rounded-lg p-4 space-y-3"
          >
            {/* Brush Size */}
            <div>
              <label className="text-sm font-medium mb-1 flex items-center justify-between">
                Brush Size
                <span className="text-muted-foreground">{settings.brushSize}px</span>
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={settings.brushSize}
                onChange={(e) => onSettingsChange?.({ brushSize: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Brush Opacity */}
            <div>
              <label className="text-sm font-medium mb-1 flex items-center justify-between">
                Opacity
                <span className="text-muted-foreground">{Math.round(settings.brushOpacity * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.brushOpacity * 100}
                onChange={(e) => onSettingsChange?.({ brushOpacity: Number(e.target.value) / 100 })}
                className="w-full"
              />
            </div>

            {/* Brush Hardness */}
            <div>
              <label className="text-sm font-medium mb-1 flex items-center justify-between">
                Hardness
                <span className="text-muted-foreground">{Math.round(settings.brushHardness * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.brushHardness * 100}
                onChange={(e) => onSettingsChange?.({ brushHardness: Number(e.target.value) / 100 })}
                className="w-full"
              />
            </div>

            {/* Feather Amount */}
            <div>
              <label className="text-sm font-medium mb-1 flex items-center justify-between">
                Feather
                <span className="text-muted-foreground">{settings.featherAmount}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={settings.featherAmount}
                onChange={(e) => onSettingsChange?.({ featherAmount: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Preview Mode */}
            <div>
              <label className="text-sm font-medium mb-2">Preview Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode('overlay')}
                  className={`flex-1 text-xs py-1 px-2 rounded ${
                    previewMode === 'overlay' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  Overlay
                </button>
                <button
                  onClick={() => setPreviewMode('mask')}
                  className={`flex-1 text-xs py-1 px-2 rounded ${
                    previewMode === 'mask' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  Mask
                </button>
                <button
                  onClick={() => setPreviewMode('difference')}
                  className={`flex-1 text-xs py-1 px-2 rounded ${
                    previewMode === 'difference' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  Difference
                </button>
              </div>
            </div>

            {/* Quick Selection */}
            <div>
              <label className="text-sm font-medium mb-2">Quick Selection</label>
              <div className="flex gap-2">
                <button
                  onClick={() => applyQuickSelection('edges')}
                  className="flex-1 text-xs py-1 px-2 bg-muted rounded hover:bg-muted/80"
                >
                  <CursorArrowRippleIcon className="w-4 h-4 mx-auto mb-1" />
                  Select Edges
                </button>
                <button
                  onClick={() => applyQuickSelection('color')}
                  className="flex-1 text-xs py-1 px-2 bg-muted rounded hover:bg-muted/80"
                >
                  <SparklesIcon className="w-4 h-4 mx-auto mb-1" />
                  Smart Select
                </button>
              </div>
            </div>

            {/* Import/Export */}
            <div className="flex gap-2">
              <button
                onClick={exportMask}
                className="flex-1 text-xs py-1 px-2 bg-muted rounded hover:bg-muted/80"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mx-auto" />
                Export
              </button>
              <label className="flex-1 text-xs py-1 px-2 bg-muted rounded hover:bg-muted/80 cursor-pointer text-center">
                <ArrowUpTrayIcon className="w-4 h-4 mx-auto" />
                Import
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importMask(file);
                  }}
                />
              </label>
            </div>
          </motion.div>
        )}

        {/* Complete Button */}
        <button
          onClick={completeMask}
          className="w-full btn-default"
        >
          Apply Mask
        </button>
      </div>
    </div>
  );
}