'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  XCircleIcon,
  ClockIcon,
  PhotoIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  BookmarkIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import type { InpaintIteration } from '../../types/inpainting';

interface InpaintStepperProps {
  iterations: InpaintIteration[];
  currentIterationId?: string;
  onIterationClick: (id: string) => void;
  onIterationEdit: (id: string, updates: Partial<InpaintIteration>) => void;
  onIterationDelete: (id: string) => void;
  onIterationDuplicate: (id: string) => void;
  onIterationBookmark?: (id: string) => void;
  allowReorder?: boolean;
  onReorder?: (iterations: InpaintIteration[]) => void;
}

interface StepStatus {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
}

const statusConfig: Record<InpaintIteration['status'], StepStatus> = {
  pending: {
    icon: ClockIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    label: 'Pending'
  },
  processing: {
    icon: ArrowPathIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Processing'
  },
  completed: {
    icon: CheckCircleSolidIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Completed'
  },
  failed: {
    icon: XCircleIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Failed'
  }
};

export default function InpaintStepper({
  iterations,
  currentIterationId,
  onIterationClick,
  onIterationEdit,
  onIterationDelete,
  onIterationDuplicate,
  onIterationBookmark,
  allowReorder = true,
  onReorder
}: InpaintStepperProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(currentIterationId || null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current iteration
  useEffect(() => {
    if (currentIterationId && scrollContainerRef.current) {
      const element = document.getElementById(`step-${currentIterationId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentIterationId]);

  const handleNoteEdit = (id: string, currentNote?: string) => {
    setEditingId(id);
    setEditingNote(currentNote || '');
  };

  const saveNote = () => {
    if (editingId) {
      onIterationEdit(editingId, { notes: editingNote });
      setEditingId(null);
      setEditingNote('');
    }
  };

  const renderStep = (iteration: InpaintIteration, index: number) => {
    const status = statusConfig[iteration.status];
    const StatusIcon = status.icon;
    const isActive = iteration.id === currentIterationId;
    const isExpanded = iteration.id === expandedId;
    const isEditing = iteration.id === editingId;

    return (
      <motion.div
        id={`step-${iteration.id}`}
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ delay: index * 0.05 }}
        className={`relative ${index < iterations.length - 1 ? 'pb-8' : ''}`}
      >
        {/* Connection Line */}
        {index < iterations.length - 1 && (
          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
        )}

        {/* Step Content */}
        <div className={`relative flex gap-3 ${isActive ? 'z-10' : ''}`}>
          {/* Step Indicator */}
          <div
            className={`relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isActive ? 'ring-2 ring-primary ring-offset-2' : ''
            } ${status.bgColor}`}
          >
            <StatusIcon className={`w-5 h-5 ${status.color}`} />
            {iteration.rating && iteration.rating >= 4 && (
              <SparklesIcon className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
            )}
          </div>

          {/* Step Card */}
          <div className="flex-1">
            <motion.div
              layout
              className={`bg-card rounded-lg border p-3 cursor-pointer transition-all ${
                isActive ? 'border-primary shadow-md' : 'hover:border-muted-foreground/30'
              }`}
              onClick={() => onIterationClick(iteration.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">
                      {iteration.metadata.region || `Iteration ${index + 1}`}
                    </h4>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${status.bgColor} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(iteration.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(isExpanded ? null : iteration.id);
                  }}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <ChevronRightIcon 
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                  />
                </button>
              </div>

              {/* Preview */}
              {iteration.imageUrl && (
                <div className="mt-2 relative aspect-video rounded overflow-hidden bg-muted">
                  <Image
                    src={iteration.imageUrl}
                    alt={`Iteration ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                  {iteration.maskUrl && (
                    <div className="absolute inset-0 bg-red-500/20 mix-blend-multiply" />
                  )}
                </div>
              )}

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2">
                      {/* Prompt */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Prompt</label>
                        <p className="text-sm mt-0.5">{iteration.prompt}</p>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          Notes
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNoteEdit(iteration.id, iteration.notes);
                            }}
                            className="p-0.5 hover:bg-muted rounded"
                          >
                            <PencilIcon className="w-3 h-3" />
                          </button>
                        </label>
                        {isEditing ? (
                          <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                            <textarea
                              value={editingNote}
                              onChange={(e) => setEditingNote(e.target.value)}
                              className="w-full text-sm bg-background border rounded px-2 py-1 resize-none"
                              rows={2}
                              autoFocus
                              onBlur={saveNote}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  saveNote();
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm mt-0.5 text-muted-foreground">
                            {iteration.notes || 'No notes added'}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 pt-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onIterationDuplicate(iteration.id)}
                          className="flex items-center gap-1 text-xs px-2 py-1 hover:bg-muted rounded transition-colors"
                        >
                          <DocumentDuplicateIcon className="w-3 h-3" />
                          Duplicate
                        </button>
                        {onIterationBookmark && (
                          <button
                            onClick={() => onIterationBookmark(iteration.id)}
                            className="flex items-center gap-1 text-xs px-2 py-1 hover:bg-muted rounded transition-colors"
                          >
                            <BookmarkIcon className="w-3 h-3" />
                            Bookmark
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Delete this iteration?')) {
                              onIterationDelete(iteration.id);
                            }
                          }}
                          className="flex items-center gap-1 text-xs px-2 py-1 hover:bg-destructive/10 text-destructive rounded transition-colors"
                        >
                          <TrashIcon className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">
          Iterations ({iterations.length})
        </h3>
        {iterations.length > 5 && (
          <span className="text-xs text-muted-foreground">
            Scroll for more
          </span>
        )}
      </div>

      {/* Steps */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pr-2">
        {allowReorder && onReorder ? (
          <Reorder.Group 
            axis="y" 
            values={iterations} 
            onReorder={onReorder}
            className="space-y-0"
          >
            {iterations.map((iteration, index) => (
              <Reorder.Item key={iteration.id} value={iteration}>
                {renderStep(iteration, index)}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <div className="space-y-0">
            {iterations.map((iteration, index) => renderStep(iteration, index))}
          </div>
        )}

        {iterations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <PhotoIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No iterations yet</p>
            <p className="text-xs mt-1">Start by drawing a mask on your image</p>
          </div>
        )}
      </div>
    </div>
  );
}