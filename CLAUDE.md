# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GenAI Kitchen is an AI-powered kitchen redesign application for Unoform (Danish kitchen manufacturer). It transforms kitchen photos using Replicate's Flux models while maintaining original structure and applying new Scandinavian-inspired designs.

## Memories
- Always search Replicate.com to find correct models.

## Common Commands

### Development
```bash
npm run dev              # Start development server on http://localhost:3000
npm run build            # Build for production
npm run start            # Start production server
```

### Testing & Deployment
```bash
npm run test:env         # Validate environment variables
npm run test:api         # Test API endpoints functionality
npm run test:api-routes  # Test all API route responses
npm run test:deploy      # Test Vercel deployment readiness
npm run deploy           # Fix env vars and deploy to Vercel
```

### Git Workflow
```bash
git add .
git commit -m "message"
git push origin main     # Deploy triggers automatically on Vercel
```

## Architecture Overview

### Tech Stack
- **Next.js 13.4.4** with App Router - React framework with server components
- **TypeScript** - Type safety throughout the codebase
- **Tailwind CSS** - Utility-first styling with custom design system
- **Replicate API** - AI model integration (Flux Pro 1.1, Flux Fill Pro, Flux Redux Dev)
- **Upstash Redis** - Rate limiting and image metadata storage
- **Bytescale** - Image upload handling
- **Jose** - JWT authentication

### Key Directories
- `/app` - Next.js App Router pages and API routes
- `/components` - React components (UI elements, canvas drawing, social sharing)
- `/utils` - Helper functions (auth, prompt templating, Redis client)
- `/styles` - Global CSS and design system files

### API Routes Pattern
All API routes follow Next.js 13 App Router convention:
- `/app/api/[endpoint]/route.ts` - Contains POST/GET handlers
- Authentication required for: `/dream`, `/saved` pages
- Public routes: `/`, `/login`

### AI Model Integration
1. **Generation**: Flux Canny Pro - Maintains structure while applying new design
2. **Inpainting**: Flux Fill Pro - Selective editing with mask drawing
3. **Variations**: Flux Redux Dev - Creates style variations

All models use 16:9 aspect ratio (1344x768px) for consistency.

### Authentication Flow
- JWT-based with HTTP-only cookies
- Middleware protects routes requiring auth
- Session stored in Redis with 7-day expiration
- Three default users configured for testing

### Prompt System
Sophisticated prompt templating that:
- Automatically adds Unoform brand styling
- Prevents duplicate style tokens
- Enhances material descriptions
- Maintains consistency across generation types

#### Known Issues & Improvements Needed
1. **Missing "Keep Existing" Options**
   - Only backsplash has "None" option
   - Users forced to specify all elements even for partial updates
   - Need "Keep Existing" options for cabinets, countertops, flooring

2. **Manual Edit Preservation**
   - Manual prompt edits are lost when UI selections change
   - No merge strategy between manual edits and generated prompts
   - Need smart merging to preserve custom additions

3. **Mode Synchronization**
   - Simple and Advanced modes don't share state
   - Switching modes loses all selections
   - Need bidirectional data sync

4. **UI/UX Improvements Needed**
   - Add tooltips explaining colored tokens in prompt preview
   - Add info icons to metadata pills
   - Implement prompt locking for preserving manual sections
   - Add prompt templates for common scenarios

### State Management
- React hooks for local state
- Custom `useImageHistory` hook for undo/redo
- Server-side session management
- Redis for persistent data storage

## Prompt System Architecture

### Components
1. **DesignTabV2** (`/components/tabs/DesignTabV2.tsx`)
   - Coordinates between Simple and Advanced modes
   - Manages prompt generation and editing state
   - Handles mode switching (but doesn't sync data)

2. **UnoformStyleSelector** (`/components/design/UnoformStyleSelector.tsx`)
   - Simple mode with predefined Unoform styles
   - Limited material selection based on style compatibility
   - Uses `buildUnoformPrompt` for structured generation

3. **KitchenDesignSelector** (`/components/design/KitchenDesignSelector.tsx`)
   - Advanced mode with comprehensive options
   - Expandable sections for all design aspects
   - Uses `KitchenPromptBuilder` for detailed generation
   - Missing "Keep Existing" options for most categories

4. **PromptPreview** (`/components/prompt/PromptPreview.tsx`)
   - Visual tokenization with color coding
   - Manual edit capability with history
   - Metadata display as pills
   - Issue: Manual edits overwritten by UI changes

### Data Flow
1. User selections → Component state
2. State changes → Prompt builder (UnoformPromptBuilder or KitchenPromptBuilder)
3. Generated prompt → PromptPreview component
4. Manual edits → Separate editedPrompt state
5. Generate button → Uses editedPrompt if manual changes, else generatedPrompt

### Problematic Scenarios
1. **Partial Updates**: User wants to change only cabinets but forced to specify everything
2. **Edit Loss**: Manual customizations lost when changing UI selections
3. **Mode Switching**: All selections lost when switching between Simple/Advanced
4. **No Explanations**: Users don't understand colored tokens or metadata pills

## Key Implementation Details

### Image Processing
- Always use 16:9 aspect ratio (1344x768px)
- Canvas drawing for inpainting masks must match image dimensions
- Social media sharing includes smart cropping for different platforms
- Bytescale handles uploads with automatic optimization

### Unoform Brand Requirements
- Colors: #C19A5B (gold), #4C4C4C (gray-dark)
- Font: Work Sans (weights: 200, 300, 400, 500)
- Button styling: 1.2px border, 2.63px letter spacing, uppercase
- Minimalist Scandinavian aesthetic throughout

### Error Handling
- All API routes include try-catch with detailed error responses
- Replicate polling includes timeout handling (5 minutes max)
- Rate limiting via Redis (configurable, currently disabled for testing)
- Frontend shows user-friendly error messages

### Performance Considerations
- Image lazy loading with Next.js Image component
- Efficient polling for AI model results
- Canvas operations use willReadFrequently for better performance
- Minimal CSS with no @apply directives to avoid build issues

## Environment Variables Required

```bash
REPLICATE_API_KEY=          # Replicate API access
UPSTASH_REDIS_REST_URL=     # Redis database URL
UPSTASH_REDIS_REST_TOKEN=   # Redis authentication
JWT_SECRET=                 # JWT signing secret
NEXT_PUBLIC_UPLOAD_API_KEY= # Bytescale widget key
```

## Recent Updates (January 2025)

### Codebase Cleanup
- Migrated all API routes to new `unoformPromptBuilder` system
- Removed legacy prompt templating files
- Deleted 20+ unused components and test files
- Consolidated to single prompt building system
- Upgraded inpainting to MaskDrawingCanvasV2 with professional features

### Current Issues to Address
1. Add "Keep Existing" options throughout KitchenDesignSelector
2. Implement prompt merging to preserve manual edits
3. Add state synchronization between Simple/Advanced modes
4. Add UI documentation (tooltips, help text, legends)
5. Implement prompt locking mechanism
6. Create prompt templates for common workflows

## Current Deployment

- Production URL: https://genaikitchen-avse9hgjh-jespers-projects-dbff6d83.vercel.app
- Auto-deploys from main branch
- Test credentials: demo_user/KitchenDesign123
```