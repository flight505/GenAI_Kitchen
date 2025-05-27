'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { 
  Grid3X3, 
  List, 
  Calendar,
  Search,
  Filter,
  Download,
  Trash2,
  Tag,
  FolderOpen,
  Check,
  X,
  Eye,
  Copy,
  ChevronDown,
  Clock,
  DollarSign,
  Cpu,
  Palette,
  Settings
} from 'lucide-react';

interface ImageAsset {
  id: string;
  url: string;
  thumbnail?: string;
  metadata: {
    model: string;
    parameters: Record<string, any>;
    prompt: string;
    cost: number;
    generatedAt: Date;
    tags: string[];
    dimensions: { width: number; height: number };
    projectId?: string;
  };
  relationships: {
    parentId?: string;
    childIds: string[];
    referenceIds: string[];
  };
}

interface Project {
  id: string;
  name: string;
  images: ImageAsset[];
  createdAt: Date;
  updatedAt: Date;
}

interface ImageLibraryProps {
  projects: Project[];
  onImageSelect: (images: ImageAsset[], mode: 'primary' | 'reference') => void;
  selectionMode: 'single' | 'multiple' | 'reference';
}

interface FilterState {
  model: string;
  dateRange: { start: Date | null; end: Date | null };
  tags: string[];
  project: string;
  costRange: { min: number; max: number };
}

function ImageCard({ 
  image, 
  isSelected, 
  onClick, 
  onTagClick,
  view 
}: { 
  image: ImageAsset; 
  isSelected: boolean; 
  onClick: () => void;
  onTagClick: (tag: string) => void;
  view: 'grid' | 'list';
}) {
  const [showDetails, setShowDetails] = useState(false);

  if (view === 'list') {
    return (
      <div
        className={`
          flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all
          ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}
        `}
        onClick={onClick}
      >
        <div className="relative flex-shrink-0">
          <Image
            src={image.thumbnail || image.url}
            alt={image.metadata.prompt}
            width={80}
            height={60}
            className="rounded object-cover"
          />
          {isSelected && (
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
              <Check className="h-3 w-3" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{image.metadata.prompt}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              {image.metadata.model}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(image.metadata.generatedAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${image.metadata.cost.toFixed(3)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {image.metadata.tags.slice(0, 2).map(tag => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick(tag);
              }}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
            >
              {tag}
            </button>
          ))}
          {image.metadata.tags.length > 2 && (
            <span className="text-xs text-gray-500">+{image.metadata.tags.length - 2}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all
        ${isSelected ? 'border-primary shadow-lg' : 'border-gray-200 hover:border-gray-300'}
      `}
      onClick={onClick}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <div className="aspect-[16/9] relative">
        <Image
          src={image.thumbnail || image.url}
          alt={image.metadata.prompt}
          fill
          className="object-cover"
        />
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1.5">
            <Check className="h-4 w-4" />
          </div>
        )}

        {/* Hover overlay */}
        {showDetails && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <p className="text-sm font-medium line-clamp-2 mb-2">{image.metadata.prompt}</p>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span>{image.metadata.model}</span>
                  <span>${image.metadata.cost.toFixed(3)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1 hover:bg-white/20 rounded" title="View details">
                    <Eye className="h-3 w-3" />
                  </button>
                  <button className="p-1 hover:bg-white/20 rounded" title="Copy parameters">
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="p-2 bg-gray-50">
        <div className="flex flex-wrap gap-1">
          {image.metadata.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-xs bg-white border border-gray-200 rounded"
            >
              {tag}
            </span>
          ))}
          {image.metadata.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{image.metadata.tags.length - 3}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ImageLibrary({ projects, onImageSelect, selectionMode }: ImageLibraryProps) {
  const [view, setView] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    model: '',
    dateRange: { start: null, end: null },
    tags: [],
    project: '',
    costRange: { min: 0, max: 1 }
  });

  // Get all images from all projects
  const allImages = useMemo(() => {
    return projects.flatMap(project => project.images);
  }, [projects]);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const models = new Set<string>();
    const tags = new Set<string>();
    let minCost = Infinity;
    let maxCost = 0;

    allImages.forEach(image => {
      models.add(image.metadata.model);
      image.metadata.tags.forEach(tag => tags.add(tag));
      minCost = Math.min(minCost, image.metadata.cost);
      maxCost = Math.max(maxCost, image.metadata.cost);
    });

    return {
      models: Array.from(models),
      tags: Array.from(tags),
      costRange: { min: minCost, max: maxCost }
    };
  }, [allImages]);

  // Filter images based on current filters and search
  const filteredImages = useMemo(() => {
    return allImages.filter(image => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!image.metadata.prompt.toLowerCase().includes(query) &&
            !image.metadata.tags.some(tag => tag.toLowerCase().includes(query)) &&
            !image.metadata.model.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Model filter
      if (filters.model && image.metadata.model !== filters.model) {
        return false;
      }

      // Date filter
      if (filters.dateRange.start && new Date(image.metadata.generatedAt) < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && new Date(image.metadata.generatedAt) > filters.dateRange.end) {
        return false;
      }

      // Tag filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => image.metadata.tags.includes(tag))) {
        return false;
      }

      // Cost filter
      if (image.metadata.cost < filters.costRange.min || image.metadata.cost > filters.costRange.max) {
        return false;
      }

      // Project filter
      if (filters.project && image.metadata.projectId !== filters.project) {
        return false;
      }

      return true;
    });
  }, [allImages, searchQuery, filters]);

  const handleImageClick = useCallback((image: ImageAsset) => {
    if (selectionMode === 'single') {
      setSelectedImages(new Set([image.id]));
      onImageSelect([image], 'primary');
    } else {
      const newSelection = new Set(selectedImages);
      if (newSelection.has(image.id)) {
        newSelection.delete(image.id);
      } else {
        newSelection.add(image.id);
      }
      setSelectedImages(newSelection);
    }
  }, [selectionMode, selectedImages, onImageSelect]);

  const handleBulkAction = (action: 'delete' | 'download' | 'tag') => {
    const selected = filteredImages.filter(img => selectedImages.has(img.id));
    
    switch (action) {
      case 'download':
        // Download selected images
        selected.forEach(image => {
          const link = document.createElement('a');
          link.href = image.url;
          link.download = `kitchen-${image.id}.jpg`;
          link.click();
        });
        break;
      
      case 'tag':
        const tag = prompt('Enter tag:');
        if (tag) {
          // Add tag to selected images
          console.log('Adding tag:', tag, 'to', selected.length, 'images');
        }
        break;
      
      case 'delete':
        if (confirm(`Delete ${selected.length} images?`)) {
          // Delete selected images
          console.log('Deleting', selected.length, 'images');
        }
        break;
    }
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
  };

  const selectAll = () => {
    setSelectedImages(new Set(filteredImages.map(img => img.id)));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="space-y-4 pb-4">
        {/* Search and View Toggle */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search images by prompt, model, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors
              ${showFilters ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-50'}
            `}
          >
            <Filter className="h-4 w-4" />
            Filters
            {Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : v !== '')) && (
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded transition-colors ${
                view === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded transition-colors ${
                view === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('timeline')}
              className={`p-1.5 rounded transition-colors ${
                view === 'timeline' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Model Filter */}
              <div>
                <label className="text-sm font-medium">Model</label>
                <select
                  value={filters.model}
                  onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                >
                  <option value="">All models</option>
                  {filterOptions.models.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              {/* Project Filter */}
              <div>
                <label className="text-sm font-medium">Project</label>
                <select
                  value={filters.project}
                  onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                >
                  <option value="">All projects</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-sm font-medium">From Date</label>
                <input
                  type="date"
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: e.target.value ? new Date(e.target.value) : null }
                  })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium">To Date</label>
                <input
                  type="date"
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: e.target.value ? new Date(e.target.value) : null }
                  })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {filterOptions.tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      const newTags = filters.tags.includes(tag)
                        ? filters.tags.filter(t => t !== tag)
                        : [...filters.tags, tag];
                      setFilters({ ...filters, tags: newTags });
                    }}
                    className={`
                      px-3 py-1 rounded-full text-sm transition-colors
                      ${filters.tags.includes(tag)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white border hover:bg-gray-50'
                      }
                    `}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => setFilters({
                model: '',
                dateRange: { start: null, end: null },
                tags: [],
                project: '',
                costRange: filterOptions.costRange
              })}
              className="text-sm text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Selection Actions */}
        {selectedImages.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {selectedImages.size} image{selectedImages.size !== 1 ? 's' : ''} selected
              </span>
              <button onClick={clearSelection} className="text-sm text-gray-600 hover:text-gray-900">
                Clear
              </button>
              <button onClick={selectAll} className="text-sm text-gray-600 hover:text-gray-900">
                Select all ({filteredImages.length})
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              {selectionMode === 'reference' && (
                <button
                  onClick={() => {
                    const selected = filteredImages.filter(img => selectedImages.has(img.id));
                    onImageSelect(selected, 'reference');
                  }}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm"
                >
                  Use as Reference
                </button>
              )}
              
              <button
                onClick={() => handleBulkAction('tag')}
                className="p-1.5 hover:bg-gray-100 rounded"
                title="Tag selected"
              >
                <Tag className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleBulkAction('download')}
                className="p-1.5 hover:bg-gray-100 rounded"
                title="Download selected"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="p-1.5 hover:bg-gray-100 rounded text-red-600"
                title="Delete selected"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {view === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredImages.map(image => (
              <ImageCard
                key={image.id}
                image={image}
                isSelected={selectedImages.has(image.id)}
                onClick={() => handleImageClick(image)}
                onTagClick={(tag) => setFilters({ ...filters, tags: [...filters.tags, tag] })}
                view="grid"
              />
            ))}
          </div>
        )}

        {view === 'list' && (
          <div className="space-y-2">
            {filteredImages.map(image => (
              <ImageCard
                key={image.id}
                image={image}
                isSelected={selectedImages.has(image.id)}
                onClick={() => handleImageClick(image)}
                onTagClick={(tag) => setFilters({ ...filters, tags: [...filters.tags, tag] })}
                view="list"
              />
            ))}
          </div>
        )}

        {view === 'timeline' && (
          <div className="space-y-6">
            {/* Group images by date */}
            {Object.entries(
              filteredImages.reduce((groups, image) => {
                const date = new Date(image.metadata.generatedAt).toDateString();
                if (!groups[date]) groups[date] = [];
                groups[date].push(image);
                return groups;
              }, {} as Record<string, ImageAsset[]>)
            )
              .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
              .map(([date, images]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">{date}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {images.map(image => (
                      <ImageCard
                        key={image.id}
                        image={image}
                        isSelected={selectedImages.has(image.id)}
                        onClick={() => handleImageClick(image)}
                        onTagClick={(tag) => setFilters({ ...filters, tags: [...filters.tags, tag] })}
                        view="grid"
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FolderOpen className="h-12 w-12 mb-3" />
            <p className="text-lg font-medium">No images found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="pt-4 border-t text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>
            Showing {filteredImages.length} of {allImages.length} images
          </span>
          <span>
            Total cost: ${filteredImages.reduce((sum, img) => sum + img.metadata.cost, 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}