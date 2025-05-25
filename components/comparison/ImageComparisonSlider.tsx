'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import Image from 'next/image';
import { 
  ArrowsRightLeftIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  ViewfinderCircleIcon,
  ChartBarSquareIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

interface ImageComparisonSliderProps {
  imageA: string;
  imageB: string;
  labelA?: string;
  labelB?: string;
  initialPosition?: number;
  springConfig?: {
    stiffness: number;
    damping: number;
  };
  mode?: 'hover' | 'drag';
  showLabels?: boolean;
  showDifferenceOverlay?: boolean;
  onPositionChange?: (position: number) => void;
}

interface Preset {
  label: string;
  position: number;
  icon?: React.ElementType;
}

const presets: Preset[] = [
  { label: '0%', position: 0 },
  { label: '25%', position: 0.25 },
  { label: '50%', position: 0.5, icon: ArrowsRightLeftIcon },
  { label: '75%', position: 0.75 },
  { label: '100%', position: 1 }
];

export default function ImageComparisonSlider({
  imageA,
  imageB,
  labelA = 'Before',
  labelB = 'After',
  initialPosition = 0.5,
  springConfig = { stiffness: 300, damping: 30 },
  mode = 'drag',
  showLabels = true,
  showDifferenceOverlay = false,
  onPositionChange
}: ImageComparisonSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [showDifference, setShowDifference] = useState(showDifferenceOverlay);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const sliderPosition = useMotionValue(initialPosition);
  const springPosition = useSpring(sliderPosition, springConfig);
  const clipPath = useTransform(springPosition, (value) => `inset(0 ${(1 - value) * 100}% 0 0)`);

  // Update container size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle mouse/touch position
  const handlePointerMove = useCallback((clientX: number) => {
    if (containerRef.current && (isDragging || (mode === 'hover' && isHovering))) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const position = Math.max(0, Math.min(1, x / rect.width));
      sliderPosition.set(position);
      onPositionChange?.(position);
    }
  }, [isDragging, isHovering, mode, sliderPosition, onPositionChange]);

  // Mouse events
  const handleMouseMove = useCallback((e: MouseEvent) => {
    handlePointerMove(e.clientX);
  }, [handlePointerMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX);
    }
  }, [handlePointerMove]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Set up global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Zoom and pan functionality
  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => Math.max(1, Math.min(3, prev + delta)));
  }, []);

  const handlePan = useCallback((e: React.MouseEvent) => {
    if (zoom > 1 && e.buttons === 1) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 100 * (zoom - 1);
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 100 * (zoom - 1);
      
      setPanPosition({ x, y });
    }
  }, [zoom]);

  // Reset view
  const resetView = useCallback(() => {
    setZoom(1);
    setPanPosition({ x: 0, y: 0 });
    sliderPosition.set(0.5);
  }, [sliderPosition]);

  // Preset navigation
  const goToPreset = useCallback((position: number) => {
    sliderPosition.set(position);
    onPositionChange?.(position);
  }, [sliderPosition, onPositionChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '5') {
        const index = parseInt(e.key) - 1;
        if (presets[index]) {
          goToPreset(presets[index].position);
        }
      } else if (e.key === 'r') {
        resetView();
      } else if (e.key === 'd') {
        setShowDifference(prev => !prev);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [goToPreset, resetView]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {/* Zoom controls */}
          <button
            onClick={() => handleZoom(-0.5)}
            disabled={zoom <= 1}
            className="p-2 rounded hover:bg-muted transition-colors disabled:opacity-50"
            aria-label="Zoom out"
          >
            <MagnifyingGlassMinusIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.5)}
            disabled={zoom >= 3}
            className="p-2 rounded hover:bg-muted transition-colors disabled:opacity-50"
            aria-label="Zoom in"
          >
            <MagnifyingGlassPlusIcon className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 rounded hover:bg-muted transition-colors"
            aria-label="Reset view"
          >
            <ViewfinderCircleIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDifference(!showDifference)}
            className={`p-2 rounded transition-colors ${
              showDifference ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
            aria-label="Toggle difference overlay"
          >
            <ChartBarSquareIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Preset buttons */}
        <div className="flex gap-1">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => goToPreset(preset.position)}
              className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors"
              aria-label={`Go to ${preset.label}`}
            >
              {preset.icon ? <preset.icon className="w-4 h-4" /> : preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg bg-muted cursor-ew-resize select-none"
        style={{ aspectRatio: '16/9' }}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={zoom > 1 ? handlePan : undefined}
      >
        {/* Image A (Background) */}
        <div 
          className="absolute inset-0"
          style={{
            transform: `scale(${zoom}) translate(${-panPosition.x}px, ${-panPosition.y}px)`,
            transformOrigin: 'center'
          }}
        >
          <Image
            src={imageA}
            alt={labelA}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            className="object-cover"
            draggable={false}
            priority
          />
        </div>

        {/* Image B (Foreground with clip) */}
        <motion.div
          className="absolute inset-0"
          style={{
            clipPath,
            transform: `scale(${zoom}) translate(${-panPosition.x}px, ${-panPosition.y}px)`,
            transformOrigin: 'center'
          }}
        >
          <Image
            src={imageB}
            alt={labelB}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            className="object-cover"
            draggable={false}
            priority
          />
        </motion.div>

        {/* Difference overlay */}
        {showDifference && (
          <div 
            className="absolute inset-0 mix-blend-difference opacity-50 pointer-events-none"
            style={{
              transform: `scale(${zoom}) translate(${-panPosition.x}px, ${-panPosition.y}px)`,
              transformOrigin: 'center'
            }}
          >
            <Image
              src={imageB}
              alt="Difference"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              className="object-cover"
              draggable={false}
            />
          </div>
        )}

        {/* Slider handle */}
        <motion.div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
          style={{
            left: useTransform(springPosition, (value) => `${value * 100}%`),
            transform: 'translateX(-50%)'
          }}
        >
          {/* Handle grip */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
            <ArrowsRightLeftIcon className="w-5 h-5 text-gray-600" />
          </div>
        </motion.div>

        {/* Labels */}
        {showLabels && (
          <>
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
              {labelA}
            </div>
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
              {labelB}
            </div>
          </>
        )}

        {/* Zoom indicator */}
        {zoom > 1 && (
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
            {Math.round(zoom * 100)}%
          </div>
        )}

        {/* Instructions */}
        {!isDragging && !isHovering && containerSize.width > 0 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-xs">
            {mode === 'drag' ? 'Drag to compare' : 'Hover to compare'}
          </div>
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-muted-foreground text-center">
        <kbd>1-5</kbd> Presets • <kbd>R</kbd> Reset • <kbd>D</kbd> Difference
      </div>
    </div>
  );
}