## Upgrade Plan: Workflow-Focused Improvements with Modern UI Architecture

### Links to Replicate.com
https://replicate.com/black-forest-labs
https://replicate.com/black-forest-labs/flux-canny-pro
https://replicate.com/black-forest-labs/flux-redux-dev
https://replicate.com/black-forest-labs/flux-fill-pro
https://replicate.com/black-forest-labs/flux-fill-dev
https://replicate.com/black-forest-labs/flux-1.1-pro

### Core Problem Analysis

**Current Workflow Issues:**
1. Single-shot process - no iteration capability
2. Result immediately replaces current image - no comparison
3. Can't refine the same area multiple times
4. No visibility into what's happening
5. State management doesn't support iterative workflows
6. **Poor navigation** - single page overwhelm
7. **No workflow guidance** - users don't understand the process
8. **Limited model visibility** - users don't know which model to use when

**Current UI Issues:**
1. Single-page application creates cognitive overload
2. No clear workflow progression
3. Poor discoverability of features
4. Mobile experience is cramped
5. No visual feedback on current workflow step

### UI Architecture Strategy: Tab-Based Workflow

**Core Concept:** Transform from single-page to **guided tab-based workflow** using modern UI components from [21st.dev](https://21st.dev).

#### **Primary Navigation: Expandable Tabs**
**Component:** [Expandable Tabs](https://21st.dev/victorwelander/expandable-tabs/default)
- **Icons-only mode** when space is limited
- **Expand on hover/click** to show labels
- **Clear workflow separation** between phases

```
[📤 Upload] [🎨 Design] [✏️ Refine] | [👁️ Compare] [🕒 History]
```

#### **Secondary Navigation: Feature Tabs**
**Component:** [Feature 108](https://21st.dev/blocks/feature-108) tab system
- **Goal-based model selection** instead of technical names
- **Visual previews** of what each model does
- **Clear descriptions** for when to use each

#### **Comparison Views: Image Sliders**
**Component:** [Image Comparison](https://21st.dev/motion-primitives/image-comparison)
- **Before/after sliders** for all operations
- **Hover and drag modes** for different interaction preferences
- **Multiple comparison formats** (side-by-side, overlay, split-screen)

#### **Progress Tracking: Stepper Components**
**Component:** [Stepper](https://21st.dev/ui/stepper)
- **Workflow step visualization** for complex operations
- **Progress indicators** with loading states
- **Branching workflow support** for different user paths

### Phase 1: UI Foundation & Model Pipeline Update (Week 1-2)

#### 1.1 Update Default Model Pipeline
**Change:** Make **FLUX Canny Pro** the default generation model instead of FLUX 1.1 Pro

**Rationale:**
- **Structure preservation** is what most users want first
- **Better for iteration** since layout is maintained
- **More predictable results** for kitchen design workflow
- **FLUX 1.1 Pro** becomes the "creative mode" option

**Updated Goal-Based Model Selection:**
```
○ Keep exact structure/angle (FLUX Canny Pro) ← DEFAULT
○ Generate fresh design (FLUX 1.1 Pro)
○ Create variations (FLUX Redux)
○ Edit specific areas (FLUX Fill Pro)
```

#### 1.2 Implement Expandable Tabs Navigation
**Location:** Create new `components/WorkflowTabs.tsx`

**21st.dev Component:** [Expandable Tabs](https://21st.dev/victorwelander/expandable-tabs/default)

**Tab Structure:**
```typescript
const workflowTabs = [
  { title: "Upload", icon: Upload, path: "/dream?tab=upload" },
  { title: "Design", icon: Palette, path: "/dream?tab=design" },
  { title: "Refine", icon: Edit, path: "/dream?tab=refine" },
  { type: "separator" },
  { title: "Compare", icon: Eye, path: "/dream?tab=compare" },
  { title: "History", icon: Clock, path: "/dream?tab=history" },
];
```

**Implementation Strategy:**
- **Build during workflow upgrades** - Each tab gets implemented when its workflow is ready
- **Progressive enhancement** - Start with basic tabs, add complexity
- **URL-based routing** - Each tab has its own URL state

#### 1.3 Create Tab-Based Page Structure
**Location:** Update `app/dream/page.tsx`

**New Structure:**
```
┌─────────────────────────────────────────┐
│ Header + Expandable Tabs Navigation    │
├─────────────────────────────────────────┤
│ Tab Content Area                        │
│ ┌─────────────────────────────────────┐ │
│ │ Dynamic content based on active tab │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Context Panel (parameters, prompt, etc)│
└─────────────────────────────────────────┘
```

### Phase 2: Design Tab - Enhanced Model Selection (Week 2-3)

#### 2.1 Goal-Based Model Selection Interface
**Component:** [Feature 108](https://21st.dev/blocks/feature-108) tabs

**Location:** Create `components/ModelSelectionTabs.tsx`

**Tab Configuration:**
```typescript
const modelTabs = [
  {
    value: "canny-pro",
    icon: <Shield className="h-4 w-4" />,
    label: "Keep Structure", // DEFAULT
    content: {
      badge: "FLUX Canny Pro",
      title: "Preserve exact kitchen layout",
      description: "Maintains walls, cabinets, and perspective while changing style. Perfect for first-time generation and when you like the current layout.",
      buttonText: "Use Structure Mode",
      imageSrc: "/preview-canny.jpg"
    }
  },
  {
    value: "flux-pro",
    icon: <Sparkles className="h-4 w-4" />,
    label: "Creative Mode",
    content: {
      badge: "FLUX 1.1 Pro",
      title: "Generate fresh kitchen design",
      description: "Complete redesign with creative freedom. Best for dramatic transformations and exploring new layouts.",
      buttonText: "Use Creative Mode",
      imageSrc: "/preview-creative.jpg"
    }
  }
];
```

#### 2.2 Enhanced Prompt Preview System
**Location:** Create `components/PromptPreview.tsx`

**Features:**
- **Live preview** of what will be sent to AI
- **Editable mode** with syntax highlighting
- **Template system** for common modifications
- **Unoform style integration** visibility

```typescript
interface PromptPreviewProps {
  selections: DesignSelections;
  customPrompt?: string;
  modelType: 'canny-pro' | 'flux-pro' | 'redux' | 'fill-pro';
  onEdit: (prompt: string) => void;
  onGenerate: () => void;
}
```

#### 2.3 Parameter Visibility & Control
**Dynamic parameter display** based on selected model:
- **FLUX Canny Pro:** Structure preservation strength, style intensity
- **FLUX 1.1 Pro:** Creativity level, layout flexibility
- **Visual sliders** with real-time preview text updates

### Phase 3: Refine Tab - Iterative Inpainting Workflow (Week 3-4)

#### 3.1 Three-Panel Inpainting Interface
**Layout Strategy:**
```
┌─────────────┬─────────────────┬─────────────┐
│ Iteration   │ Comparison      │ Prompt      │
│ Stepper     │ Slider View     │ Control     │
│             │                 │             │
│ Step 1 ✓    │ ┌─────────────┐ │ Preview:    │
│ Step 2 ✓    │ │Before|After │ │ "change to  │
│ Step 3 ⟳    │ │    [====]   │ │ stainless   │
│ Step 4 ○    │ └─────────────┘ │ steel..."   │
│             │                 │             │
│ [+ New Edit]│ Accept | Retry  │ [Generate]  │
└─────────────┴─────────────────┴─────────────┘
```

#### 3.2 Iteration Stepper Implementation
**Component:** [Stepper](https://21st.dev/ui/stepper) with labels

**Location:** Create `components/InpaintStepper.tsx`

```typescript
const InpaintStepper = ({ iterations, activeIteration, onSelectIteration }) => {
  const steps = iterations.map((iteration, index) => ({
    step: index + 1,
    title: iteration.title || `Edit ${index + 1}`,
    description: iteration.area, // "Cabinets", "Countertop", etc.
    completed: index < activeIteration,
    loading: index === activeIteration && iteration.isGenerating
  }));

  return (
    <Stepper 
      orientation="vertical" 
      variant="circle-alt"
      value={activeIteration}
      onValueChange={onSelectIteration}
    >
      {steps.map((step) => (
        <StepperItem key={step.step} {...step}>
          <StepperTrigger>
            <StepperIndicator />
            <StepperTitle>{step.title}</StepperTitle>
            <StepperDescription>{step.description}</StepperDescription>
          </StepperTrigger>
        </StepperItem>
      ))}
    </Stepper>
  );
};
```

#### 3.3 Enhanced Comparison View
**Component:** [Image Comparison](https://21st.dev/motion-primitives/image-comparison)

**Location:** Update `components/ModernInpaintUI.tsx`

**Features:**
- **Before/after slider** for each iteration
- **Spring animations** for smooth interactions
- **Multiple view modes** (hover, drag, auto-play)
- **Mobile-optimized** touch interactions

```jsx
<ImageComparison 
  enableHover 
  springOptions={{ bounce: 0.3 }}
  className="h-96 w-full rounded-lg"
>
  <ImageComparisonImage 
    src={iteration.beforeImage} 
    alt="Before edit" 
    position="left" 
  />
  <ImageComparisonImage 
    src={iteration.afterImage} 
    alt="After edit" 
    position="right" 
  />
  <ImageComparisonSlider className="bg-unoform-gold" />
</ImageComparison>
```

#### 3.4 Iterative Workflow State Management
```typescript
interface InpaintingWorkflowState {
  mode: 'drawing' | 'prompting' | 'generating' | 'comparing' | 'complete';
  baseImage: string; // Locked when entering inpaint mode
  iterations: InpaintIteration[];
  activeIteration: number;
  canExit: boolean; // Prevents accidental loss of work
}

interface InpaintIteration {
  id: string;
  beforeImage: string;
  afterImage?: string;
  mask: string;
  prompt: string;
  area: string; // User-friendly name like "Cabinets"
  timestamp: number;
  isGenerating: boolean;
  status: 'pending' | 'success' | 'error';
}
```

### Phase 4: Compare Tab - Multi-Image Analysis (Week 4-5)

#### 4.1 Gallery-Style Comparison Interface
**Layout:** Grid of all generated variations with comparison tools

**Components:**
- **Expandable Cards** for each image
- **Overlay toggles** to show differences
- **Download/share panel** for each image
- **Rating system** for user feedback

#### 4.2 Advanced Comparison Features
- **Side-by-side mode** for detailed comparison
- **Overlay blend mode** to see subtle differences
- **Zoom synchronization** across multiple images
- **Annotation tools** for feedback

### Phase 5: History Tab - Workflow Timeline (Week 5-6)

#### 5.1 Visual Workflow Timeline
**Component:** [Stepper](https://21st.dev/ui/stepper) in vertical mode

**Features:**
- **Complete workflow history** from upload to final result
- **Branching visualization** for different workflow paths
- **Checkpoint system** - can return to any step
- **Export timeline** as shareable workflow

#### 5.2 Workflow Analytics
- **Time spent** on each workflow step
- **Model usage** statistics
- **Success rate** tracking for different approaches
- **Recommended workflows** based on patterns

### Implementation Strategy: Build UI During Workflow Upgrades

#### **Concurrent Development Approach:**
1. **Week 1:** Build tab foundation while fixing inpainting workflow
2. **Week 2:** Implement model selection UI while adding prompt control
3. **Week 3:** Create comparison interfaces while building stepper workflows
4. **Week 4:** Polish interactions while adding advanced features

#### **Benefits of This Approach:**
- **Immediate user feedback** on new workflows
- **Iterative improvement** of both UX and functionality
- **Reduced risk** - each piece works before moving to next
- **Better testing** - UI and workflow tested together

### Key Implementation Notes

#### **Component Integration Strategy:**
1. **Install dependencies:** All 21st.dev components with proper setup
2. **Theme consistency:** Ensure all components use Unoform design tokens
3. **Mobile-first:** Every component must work on mobile from day one
4. **Accessibility:** Proper ARIA labels and keyboard navigation
5. **Performance:** Lazy loading for complex workflows

#### **State Management Updates:**
- **Tab-based routing** with URL persistence
- **Workflow state isolation** between tabs
- **Progress persistence** - don't lose work when switching tabs
- **Undo/redo** works across tab boundaries

#### **API Integration:**
- **Model selection** affects API calls dynamically
- **Progressive enhancement** - workflows work with JavaScript disabled
- **Error handling** - clear recovery paths for each workflow step
- **Rate limiting** - visual feedback on API limits

This upgraded plan transforms GenAI Kitchen from a single-page tool into a **professional design workflow platform** with clear guidance, iterative capabilities, and excellent user experience across all devices.

## Implementation Progress

### Phase 1: UI Foundation & Model Pipeline Update ✅ COMPLETED

#### 1.1 Update Default Model Pipeline ✅
- **Status**: COMPLETED
- **Changes Made**:
  - Updated `/app/generate/route.ts` to use FLUX Canny Pro as the default model
  - Model version: `3e03126bd3fbb9349783930f4139eb6c488aef2197c4d3fd2a826b35ccecea3d`
  - Updated parameters to match Replicate API:
    - `control_image` for structure preservation
    - `guidance: 30` (optimal for Canny Pro)
    - `steps: 50` (optimal for detail)
    - `output_format: "png"` (webp not supported)
  - Updated monitoring tracking with new model version

#### 1.2 Implement Expandable Tabs Navigation ✅
- **Status**: COMPLETED
- **Component**: `components/WorkflowTabs.tsx`
- **Features Implemented**:
  - Expandable navigation with hover/click interactions
  - Mobile-responsive with toggle button
  - Active tab indicators with smooth animations
  - Progress tracking visualization
  - Tooltips for collapsed state
  - Framer Motion animations throughout
  - URL-based routing with tab parameter

#### 1.3 Create Tab-Based Page Structure ✅
- **Status**: COMPLETED
- **Changes Made**:
  - Dream page already has tab structure implemented
  - WorkflowTabs component integrated at the top
  - Tab content switching with AnimatePresence
  - URL-based tab persistence
  - All tab components already exist in `/components/tabs/`

### Important Technical Notes

#### Replicate Model Parameters
- **FLUX Canny Pro** (Structure Preservation):
  - Version: `3e03126bd3fbb9349783930f4139eb6c488aef2197c4d3fd2a826b35ccecea3d`
  - Key inputs: `prompt`, `control_image`, `guidance` (1-100), `steps` (15-50)
  - Output formats: jpg, png (NOT webp)
  
- **FLUX 1.1 Pro** (Creative Mode):
  - Version: `c0ac672c65e947f7150492580e757a005125f444b96f96f2c3e41b013e72acea`
  - Different parameter names than Canny Pro
  
- **FLUX Fill Pro** (Inpainting):
  - Uses `image` and `mask` parameters
  - Output format must be "png" not "webp"

### Additional Fixes Applied

#### Fixed Build Errors
- **lucide-react dependency**: Replaced missing lucide-react icons with @heroicons/react
- **KitchenDropDown props**: Fixed incorrect prop usage (kitchenType → label, onChange → setValue)
- **Toggle component**: Replaced with inline toggle switch for Advanced Controls
- **ModernInpaintUI props**: Fixed prop mismatch (onInpaint → onMaskGenerated)
- **TypeScript errors**: Fixed null type issues with setOriginalPhoto

### Build Status
- ✅ **All TypeScript errors resolved**
- ✅ **Build completes successfully**
- ✅ **Development server running without errors**
- ✅ **Tab navigation fully functional**

### Next Steps

1. **Phase 2: Design Tab - Enhanced Model Selection**
   - Create goal-based model selection UI
   - Implement model switching between Canny Pro and 1.1 Pro
   - Add parameter visibility controls
   - Create prompt preview system

2. **Phase 3: Refine Tab - Iterative Inpainting**
   - Implement stepper-based iteration workflow
   - Add comparison slider for before/after
   - Create iteration history management

3. **Phase 4: Compare Tab - Multi-Image Analysis**
   - Implement gallery comparison view
   - Add image comparison slider component

4. **Phase 5: History Tab - Workflow Timeline**
   - Create visual workflow timeline
   - Add checkpoint system