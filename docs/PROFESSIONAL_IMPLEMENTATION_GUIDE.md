# Professional Implementation Guide

## Phase 1: Core Components Implementation

### 1. Model Hub Component

Create `/components/professional/ModelHub.tsx`:

```typescript
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Zap, DollarSign, Clock, Check } from 'lucide-react';
import { MODEL_CONFIGS } from '@/constants/models';

interface ModelHubProps {
  onModelSelect: (modelId: string) => void;
  currentModelId?: string;
}

export function ModelHub({ onModelSelect, currentModelId }: ModelHubProps) {
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  
  const filteredModels = MODEL_CONFIGS.filter(model => 
    selectedCapabilities.length === 0 || 
    selectedCapabilities.every(cap => model.capabilities.includes(cap))
  );

  return (
    <div className="space-y-6">
      {/* Capability Filter */}
      <div className="flex flex-wrap gap-2">
        {['inpainting', 'style-transfer', 'structure-control', 'depth-aware', 'text-to-image'].map(capability => (
          <Badge
            key={capability}
            variant={selectedCapabilities.includes(capability) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => {
              setSelectedCapabilities(prev =>
                prev.includes(capability)
                  ? prev.filter(c => c !== capability)
                  : [...prev, capability]
              );
            }}
          >
            {capability}
          </Badge>
        ))}
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModels.map(model => (
          <Card 
            key={model.id}
            className={`cursor-pointer transition-all ${
              currentModelId === model.id ? 'ring-2 ring-primary' : 'hover:shadow-lg'
            }`}
            onClick={() => onModelSelect(model.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{model.name}</span>
                {currentModelId === model.id && <Check className="h-5 w-5 text-primary" />}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{model.version}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Capabilities */}
              <div className="flex flex-wrap gap-1">
                {model.capabilities.map(cap => (
                  <Badge key={cap} variant="secondary" className="text-xs">
                    {cap}
                  </Badge>
                ))}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{model.performance.avgTime}s</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span>${model.pricing.perRun}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-muted-foreground" />
                  <span>{model.performance.quality}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Info className="h-3 w-3 text-muted-foreground" />
                  <span>{model.parameters.length} params</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground line-clamp-2">
                {model.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### 2. Parameter Control Panel

Create `/components/professional/ParameterPanel.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Save, Upload, RotateCcw } from 'lucide-react';

interface ParameterPanelProps {
  modelId: string;
  onChange: (params: Record<string, any>) => void;
  presets?: ParameterPreset[];
}

interface ParameterPreset {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export function ParameterPanel({ modelId, onChange, presets }: ParameterPanelProps) {
  const [params, setParams] = useState<Record<string, any>>({});
  const [customPresets, setCustomPresets] = useState<ParameterPreset[]>([]);
  
  const modelConfig = MODEL_CONFIGS.find(m => m.id === modelId);
  
  const updateParam = (key: string, value: any) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    onChange(newParams);
  };

  const renderParameter = (param: ParameterSchema) => {
    const value = params[param.key] ?? param.default;

    switch (param.type) {
      case 'slider':
        return (
          <div key={param.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1">
                {param.label}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{param.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <span className="text-sm font-mono">{value}</span>
            </div>
            <Slider
              value={[value]}
              onValueChange={([v]) => updateParam(param.key, v)}
              min={param.min}
              max={param.max}
              step={param.step}
              className="w-full"
            />
          </div>
        );

      case 'select':
        return (
          <div key={param.key} className="space-y-2">
            <Label>{param.label}</Label>
            <Select value={value} onValueChange={(v) => updateParam(param.key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {param.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'boolean':
        return (
          <div key={param.key} className="flex items-center justify-between">
            <Label htmlFor={param.key} className="flex items-center gap-1">
              {param.label}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{param.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Switch
              id={param.key}
              checked={value}
              onCheckedChange={(v) => updateParam(param.key, v)}
            />
          </div>
        );

      case 'number':
        return (
          <div key={param.key} className="space-y-2">
            <Label>{param.label}</Label>
            <Input
              type="number"
              value={value}
              onChange={(e) => updateParam(param.key, Number(e.target.value))}
              min={param.min}
              max={param.max}
              step={param.step}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="cost">Cost</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          {modelConfig?.parameters
            .filter(p => p.category === 'basic')
            .map(renderParameter)}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          {modelConfig?.parameters
            .filter(p => p.category === 'advanced')
            .map(renderParameter)}
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {[...(presets || []), ...customPresets].map(preset => (
              <Button
                key={preset.id}
                variant="outline"
                className="justify-start"
                onClick={() => {
                  setParams(preset.parameters);
                  onChange(preset.parameters);
                }}
              >
                <div className="text-left">
                  <p className="font-medium">{preset.name}</p>
                  <p className="text-xs text-muted-foreground">{preset.description}</p>
                </div>
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Current
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="cost" className="space-y-4">
          <CostEstimator modelId={modelId} parameters={params} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => {
          const defaults = modelConfig?.parameters.reduce((acc, p) => ({
            ...acc,
            [p.key]: p.default
          }), {});
          setParams(defaults || {});
          onChange(defaults || {});
        }}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
```

### 3. Professional Image Library

Create `/components/professional/ImageLibrary.tsx`:

```typescript
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Grid3X3, 
  List, 
  Calendar,
  Search,
  Filter,
  Download,
  Trash2,
  Tag,
  FolderOpen
} from 'lucide-react';

interface ImageLibraryProps {
  projects: Project[];
  onImageSelect: (images: ImageAsset[], mode: SelectionMode) => void;
  selectionMode: 'single' | 'multiple' | 'reference';
}

export function ImageLibrary({ projects, onImageSelect, selectionMode }: ImageLibraryProps) {
  const [view, setView] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    model: '',
    dateRange: { start: null, end: null },
    tags: [],
    project: ''
  });

  const handleImageClick = (image: ImageAsset) => {
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
  };

  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {getAllImages().map(image => (
        <div
          key={image.id}
          className={`relative group cursor-pointer rounded-lg overflow-hidden ${
            selectedImages.has(image.id) ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleImageClick(image)}
        >
          <img
            src={image.url}
            alt={image.metadata.prompt}
            className="w-full aspect-square object-cover"
          />
          
          {/* Overlay with metadata */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
              <p className="text-xs truncate">{image.metadata.model}</p>
              <p className="text-xs">${image.metadata.cost.toFixed(3)}</p>
            </div>
          </div>

          {/* Selection indicator */}
          {selectedImages.has(image.id) && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
              <Check className="h-3 w-3" />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {getAllImages().map(image => (
        <div
          key={image.id}
          className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer ${
            selectedImages.has(image.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
          }`}
          onClick={() => handleImageClick(image)}
        >
          <img
            src={image.url}
            alt={image.metadata.prompt}
            className="w-16 h-16 object-cover rounded"
          />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{image.metadata.prompt}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">{image.metadata.model}</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(image.metadata.generatedAt).toLocaleDateString()}
              </span>
              <span className="text-xs text-muted-foreground">${image.metadata.cost.toFixed(3)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {image.metadata.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              className="pl-9"
            />
          </div>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'timeline' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('timeline')}
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selection Actions */}
      {selectedImages.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">
            {selectedImages.size} image{selectedImages.size !== 1 ? 's' : ''} selected
          </span>
          
          <div className="flex items-center gap-2">
            {selectionMode === 'reference' && (
              <Button
                size="sm"
                onClick={() => {
                  const images = Array.from(selectedImages).map(id => 
                    getAllImages().find(img => img.id === id)!
                  );
                  onImageSelect(images, 'reference');
                }}
              >
                Use as Reference
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              <Tag className="h-4 w-4 mr-2" />
              Tag
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="min-h-[400px]">
        {view === 'grid' && renderGridView()}
        {view === 'list' && renderListView()}
        {view === 'timeline' && <TimelineView images={getAllImages()} />}
      </div>
    </div>
  );
}
```

### 4. Updated Workflow Component

Create `/components/professional/ProfessionalWorkflow.tsx`:

```typescript
import React, { useState } from 'react';
import { ModelHub } from './ModelHub';
import { ParameterPanel } from './ParameterPanel';
import { ImageLibrary } from './ImageLibrary';
import { JourneyMapper } from './JourneyMapper';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ProfessionalWorkflow() {
  const [selectedModel, setSelectedModel] = useState<string>('flux-pro-1.1');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [selectedImages, setSelectedImages] = useState<ImageAsset[]>([]);
  const [workflowMode, setWorkflowMode] = useState<'single' | 'batch' | 'journey'>('single');

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Model & Parameters */}
      <div className="w-96 border-r bg-muted/20 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Model Selection</h2>
            <ModelHub
              onModelSelect={setSelectedModel}
              currentModelId={selectedModel}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Parameters</h2>
            <ParameterPanel
              modelId={selectedModel}
              onChange={setParameters}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Workflow Mode Selector */}
        <div className="border-b p-4">
          <Tabs value={workflowMode} onValueChange={(v) => setWorkflowMode(v as any)}>
            <TabsList>
              <TabsTrigger value="single">Single Generation</TabsTrigger>
              <TabsTrigger value="batch">Batch Processing</TabsTrigger>
              <TabsTrigger value="journey">Visual Journey</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex">
          {/* Image Library */}
          <div className="w-80 border-r p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold mb-3">Image Library</h3>
            <ImageLibrary
              projects={[]} // Load from state
              onImageSelect={setSelectedImages}
              selectionMode={workflowMode === 'journey' ? 'multiple' : 'single'}
            />
          </div>

          {/* Canvas/Results Area */}
          <div className="flex-1 p-6">
            {workflowMode === 'single' && (
              <SingleGenerationCanvas
                model={selectedModel}
                parameters={parameters}
                sourceImage={selectedImages[0]}
              />
            )}
            
            {workflowMode === 'batch' && (
              <BatchProcessingPanel
                model={selectedModel}
                parameters={parameters}
                images={selectedImages}
              />
            )}
            
            {workflowMode === 'journey' && (
              <JourneyMapper
                project={currentProject}
                onNodeSelect={handleNodeSelect}
                onPathCreate={handlePathCreate}
              />
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="border-t p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Estimated cost: ${calculateCost(selectedModel, parameters, workflowMode)}
            </span>
            <span className="text-sm text-muted-foreground">
              Processing time: ~{estimateTime(selectedModel, parameters)} seconds
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline">Save Configuration</Button>
            <Button>
              Generate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Next Steps

1. **Update Model Constants** (`/constants/models.ts`):
   - Add complete parameter schemas for each model
   - Include capability tags
   - Add performance metrics

2. **Create Store Updates** (`/store/professionalStore.ts`):
   - Project management
   - Image library state
   - Workflow history
   - Parameter templates

3. **API Route Updates**:
   - Batch processing endpoint
   - Project save/load
   - Parameter validation
   - Cost calculation

4. **Style System**:
   - Professional color scheme
   - Dense UI layouts
   - Dark mode optimization
   - Custom scrollbars

This implementation provides a solid foundation for a professional-grade AI image generation platform while maintaining the ease of use for common workflows through presets and smart defaults.