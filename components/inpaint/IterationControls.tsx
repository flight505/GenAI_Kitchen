'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  PencilIcon,
  StarIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
  BeakerIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import type { InpaintIteration, IterationMetrics } from '../../types/inpainting';

interface IterationControlsProps {
  iteration: InpaintIteration;
  metrics?: IterationMetrics;
  onAccept: () => void;
  onRetry: () => void;
  onAdjust: () => void;
  onRedraw: () => void;
  onRename?: (name: string) => void;
  onRate?: (rating: number) => void;
  onShare?: () => void;
  onAnalyze?: () => void;
  isProcessing?: boolean;
  showAdvanced?: boolean;
}

interface ControlAction {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  tooltip?: string;
}

export default function IterationControls({
  iteration,
  metrics,
  onAccept,
  onRetry,
  onAdjust,
  onRedraw,
  onRename,
  onRate,
  onShare,
  onAnalyze,
  isProcessing = false,
  showAdvanced = false
}: IterationControlsProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(iteration.metadata.region || '');
  const [showMetrics, setShowMetrics] = useState(false);
  const [selectedRating, setSelectedRating] = useState(iteration.rating || 0);

  // Handle rename
  const handleRename = useCallback(() => {
    if (newName.trim() && onRename) {
      onRename(newName.trim());
      setIsRenaming(false);
    }
  }, [newName, onRename]);

  // Handle rating
  const handleRate = useCallback((rating: number) => {
    setSelectedRating(rating);
    onRate?.(rating);
  }, [onRate]);

  // Primary actions
  const primaryActions: ControlAction[] = [
    {
      label: 'Accept',
      icon: CheckIcon,
      onClick: onAccept,
      variant: 'primary',
      disabled: isProcessing || iteration.status !== 'completed',
      tooltip: 'Accept this iteration as final'
    },
    {
      label: 'Retry',
      icon: ArrowPathIcon,
      onClick: onRetry,
      variant: 'secondary',
      disabled: isProcessing,
      tooltip: 'Retry with same parameters'
    },
    {
      label: 'Adjust',
      icon: AdjustmentsHorizontalIcon,
      onClick: onAdjust,
      variant: 'secondary',
      disabled: isProcessing,
      tooltip: 'Adjust parameters and retry'
    },
    {
      label: 'Redraw',
      icon: PencilIcon,
      onClick: onRedraw,
      variant: 'secondary',
      disabled: isProcessing,
      tooltip: 'Draw a new mask'
    }
  ];

  // Render metrics panel
  const renderMetrics = () => {
    if (!metrics) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-muted rounded-lg p-4 space-y-3"
      >
        <h4 className="font-medium text-sm flex items-center gap-2">
          <ChartBarIcon className="w-4 h-4" />
          Iteration Metrics
        </h4>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Generation Time</span>
            <p className="font-medium">{metrics.generationTime.toFixed(1)}s</p>
          </div>
          <div>
            <span className="text-muted-foreground">Similarity</span>
            <p className="font-medium">{(metrics.similarity * 100).toFixed(0)}%</p>
          </div>
          <div>
            <span className="text-muted-foreground">Mask Coverage</span>
            <p className="font-medium">{metrics.maskCoverage.toFixed(0)}%</p>
          </div>
          <div>
            <span className="text-muted-foreground">Quality Score</span>
            <p className="font-medium">{metrics.autoQualityScore?.toFixed(1) || 'N/A'}</p>
          </div>
        </div>

        {/* Quality indicators */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <BeakerIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {metrics.similarity > 0.8 ? 'High fidelity' : 
             metrics.similarity > 0.6 ? 'Good fidelity' : 'Low fidelity'}
          </span>
          {metrics.autoQualityScore && metrics.autoQualityScore > 4 && (
            <SparklesIcon className="w-4 h-4 text-yellow-500" />
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with name and rating */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {isRenaming ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') setIsRenaming(false);
                }}
                className="flex-1 text-lg font-medium bg-transparent border-b-2 border-primary outline-none"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setIsRenaming(true)}
              className="flex items-center gap-2 group"
            >
              <h3 className="text-lg font-medium">
                {iteration.metadata.region || 'Untitled Iteration'}
              </h3>
              <PencilIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
          
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-muted-foreground">
              {new Date(iteration.timestamp).toLocaleTimeString()}
            </span>
            {iteration.status === 'processing' && (
              <span className="flex items-center gap-1 text-sm text-blue-600">
                <ClockIcon className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            )}
          </div>
        </div>

        {/* Rating */}
        {onRate && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                className="p-0.5 hover:scale-110 transition-transform"
                disabled={isProcessing}
              >
                {star <= selectedRating ? (
                  <StarSolidIcon className="w-5 h-5 text-yellow-500" />
                ) : (
                  <StarIcon className="w-5 h-5 text-muted-foreground hover:text-yellow-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status and info */}
      {iteration.notes && (
        <div className="bg-muted rounded-lg p-3">
          <p className="text-sm">{iteration.notes}</p>
        </div>
      )}

      {/* Primary action buttons */}
      <div className="grid grid-cols-2 gap-2">
        {primaryActions.map((action) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2
              ${action.variant === 'primary' 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : action.variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-muted hover:bg-muted/80'
              }
              ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={action.tooltip}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </motion.button>
        ))}
      </div>

      {/* Advanced controls */}
      {showAdvanced && (
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded hover:bg-muted transition-colors"
          >
            <ChartBarIcon className="w-4 h-4" />
            Metrics
          </button>
          
          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center gap-1 text-sm px-3 py-1 rounded hover:bg-muted transition-colors"
            >
              <ShareIcon className="w-4 h-4" />
              Share
            </button>
          )}
          
          {onAnalyze && (
            <button
              onClick={onAnalyze}
              className="flex items-center gap-1 text-sm px-3 py-1 rounded hover:bg-muted transition-colors"
            >
              <LightBulbIcon className="w-4 h-4" />
              Analyze
            </button>
          )}
        </div>
      )}

      {/* Metrics panel */}
      <AnimatePresence>
        {showMetrics && renderMetrics()}
      </AnimatePresence>

      {/* Suggestions */}
      {iteration.status === 'completed' && !iteration.rating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2"
        >
          <LightBulbIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Rate this iteration</p>
            <p className="text-blue-700 mt-0.5">
              Your feedback helps improve future suggestions
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}