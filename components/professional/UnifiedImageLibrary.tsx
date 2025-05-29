'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UploadDropzone } from '@bytescale/upload-widget-react';
import { UploadWidgetConfig } from '@bytescale/upload-widget';
import Image from 'next/image';
import { 
  Upload, 
  X, 
  Check,
  Image as ImageIcon,
  FileImage,
  Sparkles,
  Star,
  Trash2,
  Grid,
  List
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ImageItem {
  id: string;
  url: string;
  name: string;
  uploadedAt: Date;
  role?: 'source' | 'reference' | 'result';
}

interface UnifiedImageLibraryProps {
  onSourceSelect: (image: ImageItem | null) => void;
  onReferenceSelect: (images: ImageItem[]) => void;
  scenario: 'style-transfer' | 'empty-room' | 'multi-reference' | 'batch-processing';
  maxReferenceImages?: number;
}

const STORAGE_KEY = 'genai-kitchen-image-library';

export function UnifiedImageLibrary({ 
  onSourceSelect, 
  onReferenceSelect, 
  scenario,
  maxReferenceImages = 1 
}: UnifiedImageLibraryProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Load images from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const restoredImages = parsed.map((img: any) => ({
          ...img,
          uploadedAt: new Date(img.uploadedAt)
        }));
        setImages(restoredImages);
      } catch (error) {
        console.error('Failed to load saved images:', error);
      }
    }
  }, []);

  // Save images to localStorage when they change
  useEffect(() => {
    if (images.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [images]);

  // Upload configuration
  const uploadOptions: UploadWidgetConfig = {
    apiKey: process.env.NEXT_PUBLIC_UPLOAD_API_KEY!,
    maxFileCount: 5, // Reduced for better performance
    mimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
    editor: { images: { crop: false } },
    styles: {
      colors: {
        primary: '#C19A5B'
      }
    }
  };

  // Select image as source
  const selectAsSource = useCallback((image: ImageItem) => {
    setSelectedSource(image.id);
    
    // Remove from references if it was selected
    setSelectedReferences(prev => prev.filter(id => id !== image.id));
    
    onSourceSelect({ ...image, role: 'source' });
  }, [onSourceSelect]);

  // Handle file upload
  const handleUpload = useCallback(({ uploadedFiles, errors }: any) => {
    // Clear any previous errors
    setUploadError(null);
    
    if (errors && errors.length > 0) {
      const errorMessages = errors.map((err: any) => err.message || 'Upload failed').join(', ');
      setUploadError(errorMessages);
      return;
    }
    
    if (uploadedFiles && uploadedFiles.length > 0) {
      try {
        const newImages: ImageItem[] = uploadedFiles.map((file: any) => ({
          id: `${file.fileUrl}-${Date.now()}-${Math.random()}`, // Ensure unique ID
          url: file.fileUrl,
          name: file.originalFileName || 'Uploaded image',
          uploadedAt: new Date()
        }));
        
        setImages(prev => {
          // Check for duplicates by URL
          const existingUrls = new Set(prev.map(img => img.url));
          const uniqueNewImages = newImages.filter(img => !existingUrls.has(img.url));
          return [...uniqueNewImages, ...prev];
        });
        
        // Auto-select first image as source if none selected
        if (!selectedSource && newImages.length > 0) {
          selectAsSource(newImages[0]);
        }
      } catch (error) {
        console.error('Error processing uploaded files:', error);
        setUploadError('Failed to process uploaded files');
      }
    }
  }, [selectedSource, selectAsSource]);

  // Toggle image as reference
  const toggleReference = useCallback((image: ImageItem) => {
    // Can't be both source and reference
    if (image.id === selectedSource) return;

    setSelectedReferences(prev => {
      const isSelected = prev.includes(image.id);
      let newRefs: string[];

      if (isSelected) {
        // Remove from references
        newRefs = prev.filter(id => id !== image.id);
      } else {
        // Add to references (respecting max limit)
        if (scenario === 'multi-reference' && prev.length >= maxReferenceImages) {
          // Replace oldest reference
          newRefs = [...prev.slice(1), image.id];
        } else if (scenario === 'style-transfer' && prev.length >= 1) {
          // Replace single reference
          newRefs = [image.id];
        } else {
          newRefs = [...prev, image.id];
        }
      }

      // Update parent with reference images
      const referenceImages = images
        .filter(img => newRefs.includes(img.id))
        .map(img => ({ ...img, role: 'reference' as const }));
      onReferenceSelect(referenceImages);

      return newRefs;
    });
  }, [selectedSource, scenario, maxReferenceImages, images, onReferenceSelect]);

  // Delete image
  const deleteImage = useCallback((imageId: string) => {
    // Remove from state
    setImages(prev => prev.filter(img => img.id !== imageId));
    
    // Clear source selection if deleted
    if (selectedSource === imageId) {
      setSelectedSource(null);
      onSourceSelect(null);
    }
    
    // Update references if deleted
    setSelectedReferences(prev => {
      const newRefs = prev.filter(id => id !== imageId);
      
      // Get updated reference images (using the current images state before deletion)
      const remainingImages = images.filter(img => img.id !== imageId);
      const referenceImages = remainingImages
        .filter(img => newRefs.includes(img.id))
        .map(img => ({ ...img, role: 'reference' as const }));
      onReferenceSelect(referenceImages);
      
      return newRefs;
    });
  }, [selectedSource, images, onSourceSelect, onReferenceSelect]);

  // Clear all images
  const clearAll = useCallback(() => {
    setImages([]);
    setSelectedSource(null);
    setSelectedReferences([]);
    onSourceSelect(null);
    onReferenceSelect([]);
    localStorage.removeItem(STORAGE_KEY);
  }, [onSourceSelect, onReferenceSelect]);

  // Get role label for image
  const getImageRole = (imageId: string) => {
    if (imageId === selectedSource) return 'Source';
    if (selectedReferences.includes(imageId)) {
      if (scenario === 'multi-reference') {
        const index = selectedReferences.indexOf(imageId);
        return `Reference ${index + 1}`;
      }
      return 'Reference';
    }
    return null;
  };

  // Get role color
  const getRoleColor = (imageId: string) => {
    if (imageId === selectedSource) return 'bg-blue-500';
    if (selectedReferences.includes(imageId)) return 'bg-unoform-gold';
    return 'bg-gray-500';
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Image Library</h2>
          <div className="flex items-center gap-2">
            {images.length > 0 && (
              <button
                onClick={clearAll}
                className="px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded",
                viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded",
                viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-2 text-sm text-gray-600">
          {scenario === 'empty-room' ? (
            <p>Click an image to select as <span className="font-medium text-blue-600">Empty Room</span></p>
          ) : scenario === 'batch-processing' ? (
            <>
              <p>Select one <span className="font-medium text-unoform-gold">Style Reference</span></p>
              <p>Then use Batch Processing tab to upload customer images</p>
            </>
          ) : (
            <>
              <p>Click images to select as <span className="font-medium text-blue-600">Source</span></p>
              <p>Right-click or use star to set as <span className="font-medium text-unoform-gold">Reference</span></p>
            </>
          )}
        </div>
      </div>

      {/* Upload Zone */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <UploadDropzone
          options={uploadOptions}
          onUpdate={handleUpload}
          height="120px"
          width="100%"
        />
        {uploadError && (
          <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded-md flex items-center justify-between">
            <span>{uploadError}</span>
            <button
              onClick={() => setUploadError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Image Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {images.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="mx-auto h-12 w-12 mb-3 text-gray-400" />
            <p>No images in library</p>
            <p className="text-sm mt-1">Upload images to get started</p>
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-2 gap-3" 
              : "space-y-2"
          )}>
            {images.map((image) => {
              const role = getImageRole(image.id);
              const roleColor = getRoleColor(image.id);
              const isSource = image.id === selectedSource;
              const isReference = selectedReferences.includes(image.id);

              return viewMode === 'grid' ? (
                <div
                  key={image.id}
                  className={cn(
                    "relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                    isSource ? "border-blue-500 shadow-lg" : 
                    isReference ? "border-unoform-gold shadow-md" : 
                    "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => {
                    if (scenario !== 'batch-processing' || !isSource) {
                      selectAsSource(image);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (scenario !== 'empty-room') {
                      toggleReference(image);
                    }
                  }}
                >
                  <div className="aspect-video relative">
                    <Image
                      src={image.url}
                      alt={image.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover"
                      loading="lazy"
                    />
                    
                    {/* Role Badge */}
                    {role && (
                      <div className={cn(
                        "absolute top-2 left-2 px-2 py-1 text-xs font-medium text-white rounded",
                        roleColor
                      )}>
                        {role}
                      </div>
                    )}

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute top-2 right-2 flex gap-1">
                        {!isSource && scenario !== 'empty-room' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleReference(image);
                            }}
                            className={cn(
                              "p-1.5 rounded text-white transition-colors",
                              isReference ? "bg-unoform-gold hover:bg-unoform-gold-dark" : "bg-gray-600 hover:bg-gray-700"
                            )}
                            title={isReference ? "Remove as reference" : "Set as reference"}
                          >
                            <Star className={cn("h-4 w-4", isReference && "fill-current")} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(image.id);
                          }}
                          className="p-1.5 bg-red-500 hover:bg-red-600 rounded text-white transition-colors"
                          title="Delete image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Click hint */}
                      {!isSource && (
                        <div className="absolute bottom-2 left-2 text-white text-xs">
                          Click to set as {scenario === 'empty-room' ? 'room' : 'source'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate">{image.name}</p>
                  </div>
                </div>
              ) : (
                // List View
                <div
                  key={image.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                    isSource ? "border-blue-500 bg-blue-50" : 
                    isReference ? "border-unoform-gold bg-yellow-50" : 
                    "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  onClick={() => {
                    if (scenario !== 'batch-processing' || !isSource) {
                      selectAsSource(image);
                    }
                  }}
                >
                  <div className="relative w-20 h-12 flex-shrink-0 rounded overflow-hidden">
                    <Image
                      src={image.url}
                      alt={image.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{image.name}</p>
                    {role && (
                      <span className={cn(
                        "inline-block mt-1 px-2 py-0.5 text-xs font-medium text-white rounded",
                        roleColor
                      )}>
                        {role}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {!isSource && scenario !== 'empty-room' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReference(image);
                        }}
                        className={cn(
                          "p-2 rounded transition-colors",
                          isReference ? "text-unoform-gold hover:bg-yellow-100" : "text-gray-400 hover:bg-gray-100"
                        )}
                      >
                        <Star className={cn("h-4 w-4", isReference && "fill-current")} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(image.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>{images.length} {images.length === 1 ? 'image' : 'images'}</span>
          <div className="flex items-center gap-3">
            {selectedSource && (
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                Source selected
              </span>
            )}
            {selectedReferences.length > 0 && (
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-unoform-gold rounded-full" />
                {selectedReferences.length} reference{selectedReferences.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}