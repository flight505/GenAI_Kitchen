# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GenAI Kitchen is an AI-powered kitchen redesign application for Unoform (Danish kitchen manufacturer). It transforms kitchen photos using Replicate's Flux models while maintaining original structure and applying new Scandinavian-inspired designs.

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

### State Management
- React hooks for local state
- Custom `useImageHistory` hook for undo/redo
- Server-side session management
- Redis for persistent data storage

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

## Current Deployment

- Production URL: https://genaikitchen-avse9hgjh-jespers-projects-dbff6d83.vercel.app
- Auto-deploys from main branch
- Test credentials: demo_user/KitchenDesign123