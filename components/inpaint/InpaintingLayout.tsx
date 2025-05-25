'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ViewColumnsIcon,
  ViewfinderCircleIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface Panel {
  id: string;
  title: string;
  width: number;
  minWidth: number;
  maxWidth: number;
  collapsed: boolean;
}

interface InpaintingLayoutProps {
  baseImage: string;
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  onPanelResize?: (panelId: string, width: number) => void;
}

export default function InpaintingLayout({
  baseImage,
  leftPanel,
  centerPanel,
  rightPanel,
  onPanelResize
}: InpaintingLayoutProps) {
  const [panels, setPanels] = useState<Panel[]>([
    { id: 'left', title: 'Iterations', width: 320, minWidth: 240, maxWidth: 480, collapsed: false },
    { id: 'center', title: 'Canvas', width: 0, minWidth: 400, maxWidth: 1200, collapsed: false }, // 0 = flex
    { id: 'right', title: 'Comparison', width: 320, minWidth: 240, maxWidth: 480, collapsed: false }
  ]);

  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [layout, setLayout] = useState<'three-panel' | 'focus' | 'compare'>('three-panel');
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent, panelId: string) => {
    e.preventDefault();
    setIsResizing(panelId);
    startXRef.current = e.clientX;
    const panel = panels.find(p => p.id === panelId);
    if (panel) {
      startWidthRef.current = panel.width;
    }
  }, [panels]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const delta = e.clientX - startXRef.current;
    const newWidth = startWidthRef.current + (isResizing === 'left' ? delta : -delta);

    setPanels(prev => prev.map(panel => {
      if (panel.id === isResizing) {
        const clampedWidth = Math.max(panel.minWidth, Math.min(panel.maxWidth, newWidth));
        onPanelResize?.(panel.id, clampedWidth);
        return { ...panel, width: clampedWidth };
      }
      return panel;
    }));
  }, [isResizing, onPanelResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(null);
  }, []);

  // Set up global mouse event listeners
  if (typeof window !== 'undefined') {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }

  const togglePanel = useCallback((panelId: string) => {
    setPanels(prev => prev.map(panel => 
      panel.id === panelId ? { ...panel, collapsed: !panel.collapsed } : panel
    ));
  }, []);

  const setLayoutPreset = useCallback((preset: 'three-panel' | 'focus' | 'compare') => {
    setLayout(preset);
    setPanels(prev => prev.map(panel => {
      if (preset === 'focus') {
        return { ...panel, collapsed: panel.id !== 'center' };
      } else if (preset === 'compare') {
        return { ...panel, collapsed: panel.id === 'left' };
      } else {
        return { ...panel, collapsed: false };
      }
    }));
  }, []);

  const renderPanel = (panel: Panel, content: React.ReactNode, isLast: boolean = false) => {
    const isCenter = panel.id === 'center';
    const actualWidth = panel.collapsed ? 48 : (panel.width === 0 ? 'flex-1' : `${panel.width}px`);

    return (
      <motion.div
        key={panel.id}
        className={`relative ${isCenter ? 'flex-1' : ''} ${panel.collapsed ? 'overflow-hidden' : ''}`}
        style={{ 
          width: isCenter ? undefined : actualWidth,
          minWidth: panel.collapsed ? 48 : panel.minWidth
        }}
        animate={{ 
          width: isCenter ? undefined : actualWidth,
          opacity: 1 
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {/* Panel Header */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-background/80 backdrop-blur-sm border-b z-10 flex items-center justify-between px-3">
          <h3 className={`font-medium text-sm ${panel.collapsed ? 'sr-only' : ''}`}>
            {panel.title}
          </h3>
          <button
            onClick={() => togglePanel(panel.id)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            aria-label={panel.collapsed ? `Expand ${panel.title}` : `Collapse ${panel.title}`}
          >
            {panel.collapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Panel Content */}
        <div className={`pt-12 h-full ${panel.collapsed ? 'hidden' : ''}`}>
          <AnimatePresence mode="wait">
            {!panel.collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-hidden"
              >
                {content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Resize Handle */}
        {!isLast && !panel.collapsed && !isCenter && (
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors"
            onMouseDown={(e) => handleMouseDown(e, panel.id)}
          >
            <div className="absolute inset-0 w-4 -left-1.5" />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="relative h-full w-full">
      {/* Layout Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg border p-1 flex gap-1">
          <button
            onClick={() => setLayoutPreset('three-panel')}
            className={`p-2 rounded transition-colors ${
              layout === 'three-panel' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
            aria-label="Three panel layout"
          >
            <ViewColumnsIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayoutPreset('focus')}
            className={`p-2 rounded transition-colors ${
              layout === 'focus' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
            aria-label="Focus layout"
          >
            <ViewfinderCircleIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayoutPreset('compare')}
            className={`p-2 rounded transition-colors ${
              layout === 'compare' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
            aria-label="Compare layout"
          >
            <ArrowsPointingInIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div 
        ref={containerRef}
        className={`flex h-full w-full ${isResizing ? 'select-none' : ''}`}
      >
        {renderPanel(panels[0], leftPanel)}
        {renderPanel(panels[1], centerPanel)}
        {renderPanel(panels[2], rightPanel, true)}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded px-2 py-1">
        <kbd>Tab</kbd> Focus panels • <kbd>1-3</kbd> Layout presets
      </div>
    </div>
  );
}