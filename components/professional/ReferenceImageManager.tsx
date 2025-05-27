'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, GripVertical, Plus } from 'lucide-react';
import { UploadDropzone } from '@bytescale/upload-widget-react';
import { UploadWidgetConfig } from '@bytescale/upload-widget';

export interface ReferenceImage {
  id: string;
  url: string;
  name: string;
  role: 'style' | 'structure' | 'element';
  weight: number;
  elements?: string[];
}

interface ReferenceImageManagerProps {
  scenario: string;
  maxImages: number;
  images: ReferenceImage[];
  onImagesChange: (images: ReferenceImage[]) => void;
}

const uploadOptions: UploadWidgetConfig = {
  apiKey: process.env.NEXT_PUBLIC_UPLOAD_API_KEY || "free",
  maxFileCount: 5,
  mimeTypes: ["image/jpeg", "image/png", "image/jpg"],
  styles: {
    colors: {
      primary: "#C19A5B"
    }
  }
};

const elementOptions = ['cabinets', 'island', 'countertops', 'backsplash', 'colors', 'hardware', 'lighting'];

export function ReferenceImageManager({ 
  scenario, 
  maxImages = 3, 
  images,
  onImagesChange 
}: ReferenceImageManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  const handleImageUpload = useCallback((uploadedFiles: any[]) => {
    const newImages: ReferenceImage[] = uploadedFiles.map((file, index) => ({
      id: `ref-${Date.now()}-${index}`,
      url: file.fileUrl,
      name: file.originalFileName || 'Reference image',
      role: scenario === 'style-transfer' ? 'style' : 'element',
      weight: 1,
      elements: scenario === 'multi-reference' ? [] : undefined
    }));

    const updatedImages = [...images, ...newImages].slice(0, maxImages);
    onImagesChange(updatedImages);
    setShowUploader(false);
  }, [images, maxImages, onImagesChange, scenario]);

  const handleRemoveImage = useCallback((id: string) => {
    onImagesChange(images.filter(img => img.id !== id));
  }, [images, onImagesChange]);

  const handleRoleChange = useCallback((id: string, role: ReferenceImage['role']) => {
    onImagesChange(images.map(img => 
      img.id === id ? { ...img, role } : img
    ));
  }, [images, onImagesChange]);

  const handleWeightChange = useCallback((id: string, weight: number) => {
    onImagesChange(images.map(img => 
      img.id === id ? { ...img, weight } : img
    ));
  }, [images, onImagesChange]);

  const handleElementToggle = useCallback((id: string, element: string) => {
    onImagesChange(images.map(img => {
      if (img.id === id && img.elements) {
        const elements = img.elements.includes(element)
          ? img.elements.filter(e => e !== element)
          : [...img.elements, element];
        return { ...img, elements };
      }
      return img;
    }));
  }, [images, onImagesChange]);

  // Drag and drop reordering
  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItemRef.current = index;
  };

  const handleDragEnd = () => {
    if (dragItemRef.current !== null && dragOverItemRef.current !== null) {
      const draggedItem = images[dragItemRef.current];
      const newImages = [...images];
      newImages.splice(dragItemRef.current, 1);
      newImages.splice(dragOverItemRef.current, 0, draggedItem);
      onImagesChange(newImages);
    }
    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            Reference Images ({images.length}/{maxImages})
          </h3>
          {images.length < maxImages && (
            <button
              onClick={() => setShowUploader(true)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Add reference images"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {images.length === 0 && !showUploader ? (
          <div 
            onClick={() => setShowUploader(true)}
            className="h-full flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 rounded-lg transition-colors p-6"
          >
            <ImageIcon className="h-8 w-8 mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">No reference images</p>
            <p className="text-xs text-gray-500 mt-1">Click to add images</p>
          </div>
        ) : (
          <div className="space-y-4">
            {showUploader && images.length < maxImages && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <UploadDropzone
                  options={{
                    ...uploadOptions,
                    maxFileCount: maxImages - images.length
                  }}
                  onUpdate={({ uploadedFiles }) => {
                    if (uploadedFiles.length > 0) {
                      handleImageUpload(uploadedFiles);
                    }
                  }}
                  height="150px"
                  width="100%"
                />
                <button
                  onClick={() => setShowUploader(false)}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}

            {images.map((image, index) => (
              <div
                key={image.id}
                className="bg-white border border-gray-200 rounded-lg p-3 cursor-move"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 cursor-move">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={image.url} 
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {image.name}
                      </p>
                      <button
                        onClick={() => handleRemoveImage(image.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="h-3 w-3 text-gray-500" />
                      </button>
                    </div>

                    {scenario === 'style-transfer' && (
                      <div className="space-y-2">
                        <select
                          value={image.role}
                          onChange={(e) => handleRoleChange(image.id, e.target.value as ReferenceImage['role'])}
                          className="text-xs border border-gray-200 rounded px-2 py-1 w-full"
                        >
                          <option value="style">Style Source</option>
                          <option value="structure">Structure Guide</option>
                        </select>
                        
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">Influence:</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={image.weight}
                            onChange={(e) => handleWeightChange(image.id, parseFloat(e.target.value))}
                            className="flex-1 h-1"
                          />
                          <span className="text-xs font-medium text-gray-700 w-8">
                            {(image.weight * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {scenario === 'multi-reference' && image.elements && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-1">Extract elements:</p>
                        <div className="flex flex-wrap gap-1">
                          {elementOptions.map(element => (
                            <button
                              key={element}
                              onClick={() => handleElementToggle(image.id, element)}
                              className={`
                                text-xs px-2 py-0.5 rounded-full border transition-colors
                                ${image.elements?.includes(element)
                                  ? 'bg-unoform-gold text-white border-unoform-gold'
                                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                }
                              `}
                            >
                              {element}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}