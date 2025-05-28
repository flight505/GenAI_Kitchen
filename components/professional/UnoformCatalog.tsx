'use client';

import React, { useState } from 'react';
import { 
  Grid3x3,
  Download,
  Check,
  Info
} from 'lucide-react';

export interface CatalogImage {
  id: string;
  name: string;
  category: 'modern' | 'classic' | 'nordic' | 'industrial';
  url: string;
  description: string;
  materials: string[];
  colors: string[];
}

interface UnoformCatalogProps {
  onSelect: (image: CatalogImage) => void;
  selectedId?: string;
  className?: string;
}

// Mock Unoform catalog images for testing
// In production, these would come from Unoform's image database
const mockCatalogImages: CatalogImage[] = [
  {
    id: 'milano-dark-oak',
    name: 'Milano Dark Oak',
    category: 'modern',
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    description: 'Sophisticated dark oak finish with integrated handles',
    materials: ['Dark Oak Veneer', 'Matte Black Hardware'],
    colors: ['#3E2723', '#212121', '#F5F5F5']
  },
  {
    id: 'stockholm-white',
    name: 'Stockholm White',
    category: 'nordic',
    url: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=600&fit=crop',
    description: 'Clean Scandinavian design with white surfaces',
    materials: ['White Laminate', 'Brushed Steel'],
    colors: ['#FFFFFF', '#E0E0E0', '#9E9E9E']
  },
  {
    id: 'copenhagen-light',
    name: 'Copenhagen Light',
    category: 'nordic',
    url: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&h=600&fit=crop',
    description: 'Light wood with minimalist aesthetic',
    materials: ['Light Ash Wood', 'White Quartz'],
    colors: ['#F5DEB3', '#FAFAFA', '#D4A574']
  },
  {
    id: 'berlin-industrial',
    name: 'Berlin Industrial',
    category: 'industrial',
    url: 'https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=800&h=600&fit=crop',
    description: 'Raw industrial style with metal accents',
    materials: ['Dark Metal', 'Concrete', 'Reclaimed Wood'],
    colors: ['#424242', '#757575', '#8D6E63']
  },
  {
    id: 'oslo-oak',
    name: 'Oslo Oak',
    category: 'classic',
    url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop',
    description: 'Traditional oak with modern touches',
    materials: ['Natural Oak', 'Granite Countertops'],
    colors: ['#D2691E', '#696969', '#F5F5DC']
  },
  {
    id: 'malmo-midnight',
    name: 'Malmö Midnight',
    category: 'modern',
    url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800&h=600&fit=crop',
    description: 'Dramatic midnight blue with gold accents',
    materials: ['Navy Blue Lacquer', 'Brass Hardware'],
    colors: ['#191970', '#FFD700', '#FFFFFF']
  }
];

export function UnoformCatalog({ onSelect, selectedId, className }: UnoformCatalogProps) {
  const [filter, setFilter] = useState<'all' | CatalogImage['category']>('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const filteredImages = filter === 'all' 
    ? mockCatalogImages 
    : mockCatalogImages.filter(img => img.category === filter);
  
  const categories: Array<{ value: typeof filter; label: string }> = [
    { value: 'all', label: 'All Styles' },
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' },
    { value: 'nordic', label: 'Nordic' },
    { value: 'industrial', label: 'Industrial' }
  ];
  
  return (
    <div className={className}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Unoform Catalog</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{filteredImages.length} styles</span>
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="flex gap-1 flex-wrap">
          {categories.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`
                px-3 py-1 text-xs rounded-full transition-all
                ${filter === value 
                  ? 'bg-unoform-gold text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Catalog Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredImages.map((image) => (
          <div
            key={image.id}
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredId(image.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelect(image)}
          >
            <div className={`
              relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all
              ${selectedId === image.id 
                ? 'border-unoform-gold shadow-lg' 
                : 'border-transparent hover:border-gray-300'
              }
            `}>
              <img 
                src={image.url} 
                alt={image.name}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay on hover */}
              <div className={`
                absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent
                transition-opacity duration-200
                ${hoveredId === image.id ? 'opacity-100' : 'opacity-0'}
              `}>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h4 className="text-white font-medium text-sm mb-1">{image.name}</h4>
                  <p className="text-white/80 text-xs line-clamp-2">{image.description}</p>
                </div>
              </div>
              
              {/* Selected indicator */}
              {selectedId === image.id && (
                <div className="absolute top-2 right-2 p-1.5 bg-unoform-gold rounded-full">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            
            {/* Quick info */}
            <div className="mt-2">
              <h4 className="text-xs font-medium text-gray-900">{image.name}</h4>
              <div className="flex items-center gap-3 mt-1">
                {/* Color swatches */}
                <div className="flex gap-1">
                  {image.colors.slice(0, 3).map((color, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 capitalize">{image.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Info box */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
          <div>
            <p className="text-xs text-blue-900 font-medium">Testing Mode</p>
            <p className="text-xs text-blue-700 mt-0.5">
              These are sample catalog images. In production, actual Unoform catalog images would be loaded.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}