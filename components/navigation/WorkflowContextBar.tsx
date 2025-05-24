'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  PhotoIcon,
  PencilIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  SparklesIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { WorkflowState } from '@/types/workflow';
import { ModelType } from '@/types/models';

interface WorkflowContextBarProps {
  workflowState?: WorkflowState;
  onNameChange?: (name: string) => void;
  className?: string;
}

export default function WorkflowContextBar({
  workflowState,
  onNameChange,
  className = ''
}: WorkflowContextBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(workflowState?.name || 'Untitled Workflow');
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'upload';

  const handleNameSubmit = () => {
    if (editedName.trim() && onNameChange) {
      onNameChange(editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditedName(workflowState?.name || 'Untitled Workflow');
      setIsEditingName(false);
    }
  };

  const getModelIcon = (model?: ModelType) => {
    switch (model) {
      case 'canny-pro':
        return <ShieldCheckIcon className="w-4 h-4" />;
      case 'flux-pro':
        return <SparklesIcon className="w-4 h-4" />;
      default:
        return <PhotoIcon className="w-4 h-4" />;
    }
  };

  const getModelLabel = (model?: ModelType) => {
    switch (model) {
      case 'canny-pro':
        return 'FLUX Canny Pro';
      case 'flux-pro':
        return 'FLUX 1.1 Pro';
      default:
        return 'No model selected';
    }
  };

  if (isCollapsed) {
    return (
      <div className={`fixed top-20 left-0 right-0 z-40 bg-gray-50 border-b border-gray-200 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {workflowState?.name || 'Untitled Workflow'}
              </span>
              {workflowState?.iterations && workflowState.iterations.length > 0 && (
                <span className="text-xs text-gray-500">
                  {workflowState.iterations.length} iterations
                </span>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              aria-label="Expand workflow context"
            >
              <ChevronDownIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed top-20 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Left Section: Image & Name */}
          <div className="flex items-center gap-4">
            {/* Image Thumbnail */}
            <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
              {workflowState?.baseImage ? (
                <Image
                  src={workflowState.baseImage}
                  alt="Workflow base"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <PhotoIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Workflow Name */}
            <div className="flex flex-col">
              {isEditingName ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleNameSubmit}
                  onKeyDown={handleKeyDown}
                  className="text-lg font-medium text-gray-900 bg-transparent border-b-2 border-[#C19A5B] focus:outline-none px-0"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="flex items-center gap-2 group"
                >
                  <h2 className="text-lg font-medium text-gray-900">
                    {workflowState?.name || 'Untitled Workflow'}
                  </h2>
                  <PencilIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
              <span className="text-xs text-gray-500">
                {currentTab === 'upload' && 'Uploading image...'}
                {currentTab === 'design' && 'Designing...'}
                {currentTab === 'refine' && 'Refining...'}
                {currentTab === 'compare' && 'Comparing...'}
                {currentTab === 'history' && 'Viewing history...'}
              </span>
            </div>
          </div>

          {/* Center Section: Stats */}
          <div className="hidden sm:flex items-center gap-6">
            {/* Iterations */}
            <div className="flex items-center gap-2">
              <ArrowPathIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                <span className="font-medium">{workflowState?.iterations?.length || 0}</span> iterations
              </span>
            </div>

            {/* Branches */}
            {workflowState?.branches && workflowState.branches.length > 0 && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm text-gray-600">
                  <span className="font-medium">{workflowState.branches.length}</span> branches
                </span>
              </div>
            )}

            {/* Time */}
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Started {workflowState?.createdAt ? new Date(workflowState.createdAt).toLocaleTimeString() : 'now'}
              </span>
            </div>
          </div>

          {/* Right Section: Model & Actions */}
          <div className="flex items-center gap-4">
            {/* Current Model */}
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
              {getModelIcon(workflowState?.currentModel)}
              <span className="text-sm font-medium text-gray-700">
                {getModelLabel(workflowState?.currentModel)}
              </span>
            </div>

            {/* Collapse Button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 hover:bg-gray-100 rounded transition-colors lg:hidden"
              aria-label="Collapse workflow context"
            >
              <ChevronUpIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}