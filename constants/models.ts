/**
 * Model configurations and constants
 */

import { ModelConfiguration } from '../types/models';

export const MODEL_CONFIGS: Record<string, ModelConfiguration> = {
  'flux-canny-pro': {
    id: 'flux-canny-pro',
    type: 'canny-pro',
    name: 'FLUX Canny Pro',
    version: '3e03126bd3fbb9349783930f4139eb6c488aef2197c4d3fd2a826b35ccecea3d',
    description: 'Professional edge-guided image generation. Maintains exact structure while changing style.',
    capabilities: [
      {
        name: 'Structure Preservation',
        description: 'Maintains walls, cabinets, and architectural elements'
      },
      {
        name: 'Style Transfer',
        description: 'Changes materials and finishes while keeping layout'
      },
      {
        name: 'Edge Detection',
        description: 'Automatic Canny edge detection for precise control'
      }
    ],
    parameters: {
      required: [
        {
          name: 'prompt',
          type: 'string',
          description: 'Text description of desired output'
        },
        {
          name: 'control_image',
          type: 'file',
          description: 'Input image for structure guidance'
        }
      ],
      optional: [
        {
          name: 'guidance',
          type: 'number',
          description: 'Controls prompt adherence',
          min: 1,
          max: 100,
          default: 30
        },
        {
          name: 'steps',
          type: 'number',
          description: 'Number of diffusion steps',
          min: 15,
          max: 50,
          default: 50
        },
        {
          name: 'safety_tolerance',
          type: 'number',
          description: 'Content safety level',
          min: 1,
          max: 6,
          default: 2
        }
      ],
      defaults: {
        guidance: 30,
        steps: 50,
        safety_tolerance: 2,
        output_format: 'png'
      }
    },
    costPerRun: 0.032,
    averageTime: 15,
    maxTimeout: 300
  },
  
  'flux-1.1-pro': {
    id: 'flux-1.1-pro',
    type: 'flux-pro',
    name: 'FLUX 1.1 Pro',
    version: '80a09d66baa990429c2f5ae8a4306bf778a1b3775afd01cc2cc8bdbe9033769c',
    description: 'Creative text-to-image generation with complete design freedom.',
    capabilities: [
      {
        name: 'Creative Freedom',
        description: 'Generate entirely new layouts and designs'
      },
      {
        name: 'High Quality',
        description: 'Superior image quality and detail'
      },
      {
        name: 'Flexible Output',
        description: 'Multiple aspect ratios and resolutions'
      }
    ],
    parameters: {
      required: [
        {
          name: 'prompt',
          type: 'string',
          description: 'Text description of desired output'
        }
      ],
      optional: [
        {
          name: 'aspect_ratio',
          type: 'select',
          description: 'Output image aspect ratio',
          options: ['1:1', '16:9', '3:2', '4:3', '9:16'],
          default: '16:9'
        },
        {
          name: 'width',
          type: 'number',
          description: 'Output width (multiple of 32)',
          min: 256,
          max: 1440,
          default: 1344
        },
        {
          name: 'height',
          type: 'number',
          description: 'Output height (multiple of 32)',
          min: 256,
          max: 1440,
          default: 768
        }
      ],
      defaults: {
        aspect_ratio: '16:9',
        width: 1344,
        height: 768,
        safety_tolerance: 2,
        output_format: 'png'
      }
    },
    costPerRun: 0.04,
    averageTime: 20,
    maxTimeout: 300
  },
  
  'flux-fill-pro': {
    id: 'flux-fill-pro',
    type: 'fill-pro',
    name: 'FLUX Fill Pro',
    version: 'latest', // Update with actual version when available
    description: 'Professional inpainting for selective area editing.',
    capabilities: [
      {
        name: 'Selective Editing',
        description: 'Modify specific areas while preserving others'
      },
      {
        name: 'Context Aware',
        description: 'Seamlessly blends edits with surroundings'
      },
      {
        name: 'Mask Support',
        description: 'Precise control with drawn masks'
      }
    ],
    parameters: {
      required: [
        {
          name: 'image',
          type: 'file',
          description: 'Base image to edit'
        },
        {
          name: 'mask',
          type: 'file',
          description: 'Mask indicating areas to edit'
        },
        {
          name: 'prompt',
          type: 'string',
          description: 'Description of desired changes'
        }
      ],
      optional: [
        {
          name: 'guidance',
          type: 'number',
          description: 'Controls prompt adherence',
          min: 1,
          max: 30,
          default: 7.5
        },
        {
          name: 'steps',
          type: 'number',
          description: 'Number of diffusion steps',
          min: 20,
          max: 100,
          default: 50
        }
      ],
      defaults: {
        guidance: 7.5,
        steps: 50,
        safety_tolerance: 2,
        output_format: 'png'
      }
    },
    costPerRun: 0.035,
    averageTime: 18,
    maxTimeout: 300
  }
};

// Model selection helpers
export const getModelConfig = (modelType: string): ModelConfiguration | undefined => {
  return Object.values(MODEL_CONFIGS).find(config => config.type === modelType);
};

export const getModelVersion = (modelType: string): string | undefined => {
  const config = getModelConfig(modelType);
  return config?.version;
};

export const getModelDefaults = (modelType: string): Record<string, any> => {
  const config = getModelConfig(modelType);
  return config?.parameters.defaults || {};
};