# Professional UI Complete Design & Implementation Guide

## Executive Summary

This document consolidates all professional UI requirements for GenAI Kitchen, providing a unified guide for building a production-ready interface that supports advanced workflows for Unoform employees. The professional interface extends the consumer `/dream` interface with full model access, granular parameter control, and three key advanced scenarios.

## Core Design Principles

### 1. **Extend, Don't Replace**
- Build upon proven `/dream` components (UploadDropzone, CompareSlider, Toast)
- Maintain Unoform brand consistency (#C19A5B gold, clean typography)
- Use same API endpoints with extended capabilities

### 2. **Professional Without Complexity**
- Clean, uncluttered interface with logical grouping
- Progressive disclosure (basic → advanced → expert modes)
- Smart defaults with full customization available

### 3. **Workflow-Centric Design**
- Support three primary scenarios from day one
- Visual feedback for multi-step processes
- Cost and time transparency at every step

## Three Advanced Scenarios

### Scenario 1: Reference Style Transfer
**User Story**: "I want to show a customer how our Milano Dark Oak style would look in their actual kitchen"

**Implementation**:
```typescript
// Uses FLUX Redux for style mixing
const styleTransferWorkflow = {
  inputs: {
    customerKitchen: Image,      // Their actual space
    styleReference: Image,       // Unoform showroom/catalog
    preserveLayout: boolean,     // Keep room structure
    styleStrength: 0-1          // How much style to apply
  },
  model: 'flux-redux-dev',
  output: 'styled kitchen maintaining original layout'
}
```

### Scenario 2: Empty Room Projection
**User Story**: "I have photos of an empty room and want to show a complete kitchen installation"

**Implementation**:
```typescript
// Uses FLUX Depth or FLUX Pro with perspective prompting
const emptyRoomWorkflow = {
  inputs: {
    emptyRoom: Image,           // Bare room photo
    roomDimensions: {w,h,d},    // Optional measurements
    kitchenStyle: UnoformStyle, // Selected design
    perspective: 'auto'         // Or manual guides
  },
  model: 'flux-depth-dev' || 'flux-1.1-pro',
  output: 'fully furnished kitchen with proper perspective'
}
```

### Scenario 3: Multi-Reference Composition
**User Story**: "I like the cabinets from design A, the island from B, and the color scheme from C"

**Implementation**:
```typescript
// Uses FLUX Redux iteratively or FLUX Pro with composite prompting
const multiReferenceWorkflow = {
  inputs: {
    targetSpace: Image,         // Customer's kitchen
    references: [{
      image: Image,
      elements: ['cabinets', 'island', 'colors'],
      weight: 0-1
    }],
    blendMode: 'sequential' || 'weighted'
  },
  model: 'flux-redux-dev',
  output: 'kitchen combining selected elements'
}
```

## UI Architecture

### Layout Structure (Inspired by 21st.dev Components)
```
┌─────────────────────────────────────────────────────────────────┐
│  GenAI Kitchen Pro                          demo_user  [Logout]  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┬──────────────┬─────────────────┐          │
│  │ Style Transfer  │  Empty Room  │ Multi-Reference │          │
│  └─────────────────┴──────────────┴─────────────────┘          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━          │
├─────────────────────────────────────────────────────────────────┤
│  Model: [FLUX Redux ▼]  Cost: $0.025/img  Time: ~12s           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────┐  ┌───────────────────────┐ │
│  │                                 │  │   Reference Manager   │ │
│  │      Main Canvas Area          │  │  ┌─────┐ ┌─────┐     │ │
│  │   ┌─────────────────────┐     │  │  │     │ │     │     │ │
│  │   │                     │     │  │  └─────┘ └─────┘     │ │
│  │   │  [Drop Image Here]  │     │  │  + Add Reference      │ │
│  │   │                     │     │  │                       │ │
│  │   └─────────────────────┘     │  │  Style Elements:      │ │
│  │                                 │  │  ☑ Cabinets           │ │
│  │   ═══════════════════════      │  │  ☑ Materials          │ │
│  │   Strength    [━━━━━━━━]      │  │  ☐ Layout             │ │
│  │   Guidance    [━━━━━━━━]      │  │  ☐ Colors             │ │
│  └─────────────────────────────────┘  └───────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [◀] 3/5 [▶]  Undo  Redo    [Download] [Share] [Save] [Generate]│
└─────────────────────────────────────────────────────────────────┘
```

### Modern UI Components (21st.dev Inspired)

#### 1. **Tabs with Underline Indicator**
```typescript
// Professional scenario tabs with active underline
const ScenarioTabs = () => (
  <TabsList className="h-auto rounded-none border-b border-gray-200 bg-transparent p-0">
    <TabsTrigger
      value="style-transfer"
      className="relative rounded-none py-3 px-6 text-sm font-medium after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-unoform-gold"
    >
      <Sparkles className="h-4 w-4 mr-2" />
      Style Transfer
    </TabsTrigger>
    {/* More tabs... */}
  </TabsList>
);
```

#### 2. **Multi-File Upload with Preview Grid**
```typescript
// Enhanced upload area with drag-drop and preview
const ReferenceUploadZone = () => {
  const [isDragging, setIsDragging] = useState(false);
  
  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 transition-all",
        isDragging ? "border-unoform-gold bg-gold-50" : "border-gray-300",
        "hover:border-gray-400 cursor-pointer"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm">Drop reference images or click to browse</p>
      </div>
    </div>
  );
};
```

#### 3. **Collapsible Sidebar (No Dark Mode)**
```typescript
// Clean, minimal sidebar that collapses to icons
const ProfessionalSidebar = () => (
  <Sidebar className="bg-gray-50 border-r border-gray-200">
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Workflow</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Model Selection">
              <Cpu className="h-4 w-4" />
              <span>Models</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* More menu items */}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
);
```

#### 4. **Resizable Panels for Workspace**
```typescript
// Flexible workspace with resizable sections
const WorkspaceLayout = () => (
  <ResizablePanelGroup direction="horizontal" className="h-full">
    <ResizablePanel defaultSize={70} minSize={50}>
      <MainCanvas />
    </ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel defaultSize={30} minSize={20}>
      <ReferenceManager />
    </ResizablePanel>
  </ResizablePanelGroup>
);
```

## Component Specifications

### 1. ScenarioSelector Component
```typescript
// Top navigation for workflow selection
interface ScenarioSelectorProps {
  scenarios: Array<{
    id: 'style-transfer' | 'empty-room' | 'multi-reference';
    name: string;
    icon: ReactNode;
    description: string;
  }>;
  activeScenario: string;
  onChange: (scenario: string) => void;
}
```

### 2. Enhanced ProfessionalInterface
Building on ProfessionalInterfaceV2.tsx:

```typescript
interface ProfessionalInterfaceProps {
  scenario: 'style-transfer' | 'empty-room' | 'multi-reference';
}

// Extend state to support scenarios
interface WorkflowState {
  selectedModel: string;
  parameters: Record<string, any>;
  sourceImage: string | null;
  referenceImages: Array<{
    id: string;
    url: string;
    role: 'style' | 'structure' | 'element';
    weight?: number;
  }>;
  isProcessing: boolean;
  resultImage: string | null;
  prompt: string;
  roomDimensions?: { width: number; height: number; depth: number };
}
```

### 3. ReferenceImageManager Component
```typescript
interface ReferenceImageManagerProps {
  scenario: string;
  maxImages: number;
  onImagesChange: (images: ReferenceImage[]) => void;
}

// Features:
// - Drag & drop reordering
// - Role assignment (style/structure/element)
// - Weight sliders for influence
// - Element checkboxes for multi-reference
```

### 4. ParameterPanel Extensions
Add scenario-specific parameters:

```typescript
// Style Transfer Parameters
{
  styleStrength: { min: 0, max: 1, default: 0.8, label: 'Style Influence' },
  preserveStructure: { type: 'boolean', default: true, label: 'Keep Layout' },
  colorBlending: { options: ['replace', 'blend', 'tint'], default: 'blend' }
}

// Empty Room Parameters
{
  perspectiveMode: { options: ['auto', 'manual', 'guided'], default: 'auto' },
  roomHeight: { min: 2.4, max: 4, default: 2.7, label: 'Ceiling Height (m)' },
  lightingCondition: { options: ['natural', 'evening', 'bright'], default: 'natural' }
}

// Multi-Reference Parameters
{
  blendMode: { options: ['sequential', 'weighted', 'selective'], default: 'weighted' },
  featureExtraction: { type: 'multi-select', options: ['cabinets', 'island', 'backsplash', 'colors'] }
}
```

## API Implementation

### 1. Update `/api/style-transfer/route.ts`
```typescript
export async function POST(request: Request) {
  const { sourceImage, referenceImage, scenario, parameters } = await request.json();

  switch (scenario) {
    case 'style-transfer':
      return handleStyleTransfer(sourceImage, referenceImage, parameters);
    
    case 'empty-room':
      return handleEmptyRoom(sourceImage, parameters);
    
    case 'multi-reference':
      return handleMultiReference(sourceImage, referenceImages, parameters);
  }
}

async function handleStyleTransfer(source: string, reference: string, params: any) {
  const input = {
    image: source,
    reference_image: reference,
    prompt: buildStyleTransferPrompt(params),
    strength: params.styleStrength || 0.8,
    guidance_scale: params.guidance || 3.5
  };
  
  return replicate.run('black-forest-labs/flux-redux-dev', { input });
}
```

### 2. Create `/api/empty-room/route.ts`
```typescript
async function handleEmptyRoom(emptyRoom: string, params: any) {
  // Use FLUX Pro with perspective-aware prompting
  const input = {
    prompt: buildEmptyRoomPrompt(params),
    aspect_ratio: '16:9',
    width: 1344,
    height: 768,
    guidance_scale: 7.5,
    num_inference_steps: 50
  };
  
  return replicate.run('black-forest-labs/flux-1.1-pro', { input });
}
```

### 3. Create `/api/multi-reference/route.ts`
```typescript
async function handleMultiReference(target: string, references: ReferenceImage[], params: any) {
  // Sequential processing with Redux
  let currentImage = target;
  
  for (const ref of references) {
    const input = {
      image: currentImage,
      prompt: buildElementPrompt(ref.elements, ref.weight),
      guidance_scale: 3.5 * ref.weight
    };
    
    currentImage = await replicate.run('black-forest-labs/flux-redux-dev', { input });
  }
  
  return currentImage;
}
```

## Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)
1. ✅ Fix TypeScript errors in ProfessionalInterfaceV2
2. ✅ Clean up unused components
3. ⬜ Implement modern tabs with underline indicator for scenarios
4. ⬜ Create drag-drop multi-image upload component
5. ⬜ Build resizable panel layout for workspace
6. ⬜ Extend WorkflowState for reference images
7. ⬜ Create ReferenceImageManager component

### Phase 2: Style Transfer (Week 2)
1. ⬜ Update style-transfer API for Redux model
2. ⬜ Add reference image upload UI
3. ⬜ Implement style strength controls
4. ⬜ Add element selection checkboxes
5. ⬜ Test with Unoform catalog images

### Phase 3: Empty Room (Week 3)
1. ⬜ Create empty-room API endpoint
2. ⬜ Add room dimension inputs
3. ⬜ Implement perspective guides overlay
4. ⬜ Create empty room detection
5. ⬜ Add lighting condition selector

### Phase 4: Multi-Reference (Week 4)
1. ⬜ Create multi-reference API endpoint
2. ⬜ Implement sequential processing logic
3. ⬜ Add weight sliders for each reference
4. ⬜ Create element selection grid
5. ⬜ Add blend mode selector

### Phase 5: Polish & Testing (Week 5)
1. ⬜ Add cost estimation for each scenario
2. ⬜ Implement progress tracking
3. ⬜ Create scenario-specific presets
4. ⬜ Add export templates
5. ⬜ Performance optimization

## Model Requirements

### Verified Available Models
- ✅ `flux-1.1-pro` - Creative generation, empty rooms
- ✅ `flux-canny-pro` - Structure preservation
- ✅ `flux-dev-inpainting` - Selective editing
- ✅ `flux-redux-dev` - Style transfer and variations

### Model Selection by Scenario
1. **Style Transfer**: FLUX Redux Dev (primary), FLUX Pro (fallback)
2. **Empty Room**: FLUX Pro with prompting, FLUX Depth (if available)
3. **Multi-Reference**: FLUX Redux Dev (sequential), FLUX Pro (composite)

## Testing Checklist

### Functional Tests
- [ ] Upload single image for basic generation
- [ ] Upload reference image for style transfer
- [ ] Process empty room with dimension input
- [ ] Combine 3 reference images with different weights
- [ ] Undo/redo through workflow steps
- [ ] Export results in multiple formats

### UI/UX Tests
- [ ] Scenario switching preserves relevant state
- [ ] Parameter changes update in real-time
- [ ] Cost estimation accurate for each scenario
- [ ] Progress indicators for long operations
- [ ] Error messages are helpful and specific
- [ ] Mobile responsive (tablet minimum)

### Performance Tests
- [ ] Image upload < 2 seconds
- [ ] Generation starts < 500ms after click
- [ ] UI remains responsive during processing
- [ ] Multiple images don't slow interface
- [ ] History navigation is instant

## Success Metrics

1. **Efficiency**: Professional users complete tasks 50% faster than in /dream
2. **Quality**: 90% of generations meet client presentation standards
3. **Flexibility**: Support 100% of the three core scenarios
4. **Reliability**: < 1% error rate in production
5. **Adoption**: 80% of Unoform employees prefer professional interface

## UI Component Library

### From 21st.dev Integration
1. **Tabs Component** - Clean tabs with underline indicator for scenario switching
2. **Upload Component** - Multi-file drag-drop with preview grid
3. **Sidebar Component** - Collapsible navigation (light theme only)
4. **Resizable Panels** - Flexible workspace layout

### Custom Professional Components
1. **ModelSelector** - Dropdown with cost/performance info
2. **ParameterSlider** - Branded sliders with value display
3. **ReferenceGrid** - Image grid with role assignment
4. **ProgressTracker** - Multi-step workflow indicator
5. **CostEstimator** - Real-time pricing calculator

## Design Tokens

### Colors
```css
--unoform-gold: #C19A5B;
--unoform-gold-light: #D4B07A;
--unoform-gold-dark: #A88449;
--unoform-gray: #4C4C4C;
--unoform-gray-light: #F5F5F5;
```

### Typography
```css
--font-primary: 'Work Sans', sans-serif;
--font-weight-light: 200;
--font-weight-regular: 400;
--font-weight-medium: 500;
--letter-spacing-button: 2.63px;
```

### Spacing
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

## Conclusion

This guide provides a complete blueprint for implementing the professional UI with full support for advanced scenarios. By incorporating modern UI patterns from 21st.dev while maintaining Unoform's brand identity, we create a professional tool that is both powerful and approachable.

The implementation focuses on:
1. **Clean, modern UI** - No dark patterns, minimal aesthetic
2. **Professional workflows** - Three core scenarios fully supported
3. **Incremental development** - Build and test each feature thoroughly
4. **User efficiency** - 50% faster than consumer interface

Next steps: Begin Phase 1 implementation with the modern tab navigation system.