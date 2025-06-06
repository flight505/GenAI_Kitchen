/**
 * Model configurations and constants
 */

import { ModelConfiguration } from '../types/models';

export const MODEL_CONFIGS: Record<string, ModelConfiguration> = {
  'interior-design': {
    id: 'interior-design',
    type: 'interior-specialized',
    name: 'Interior Design AI',
    version: 'latest',
    replicateId: 'adirik/interior-design',
    description: 'Specialized model for realistic interior design with enhanced style transfer capabilities.',
    capabilities: [
      {
        name: 'Interior Optimization',
        description: 'Specifically trained on interior spaces'
      },
      {
        name: 'Style Transfer',
        description: 'Better understanding of furniture and materials'
      },
      {
        name: 'Negative Prompting',
        description: 'Avoid unwanted elements with negative prompts'
      }
    ],
    parameters: {
      required: [
        {
          name: 'image',
          type: 'file',
          description: 'Reference image as base'
        },
        {
          name: 'prompt',
          type: 'string',
          description: 'Detailed description of desired design'
        }
      ],
      optional: [
        {
          name: 'negative_prompt',
          type: 'string',
          description: 'Elements to avoid',
          default: ''
        },
        {
          name: 'guidance_scale',
          type: 'number',
          description: 'Prompt adherence strength',
          min: 1,
          max: 20,
          default: 7.5
        },
        {
          name: 'prompt_strength',
          type: 'number',
          description: 'Transformation strength',
          min: 0,
          max: 1,
          default: 0.8
        },
        {
          name: 'num_inference_steps',
          type: 'number',
          description: 'Quality steps',
          min: 20,
          max: 50,
          default: 30
        },
        {
          name: 'seed',
          type: 'number',
          description: 'Random seed (-1 for random)',
          min: -1,
          max: 2147483647,
          default: -1
        }
      ],
      defaults: {
        negative_prompt: '',
        guidance_scale: 7.5,
        prompt_strength: 0.8,
        num_inference_steps: 30,
        seed: -1,
        output_format: 'png'
      }
    },
    costPerRun: 0.008,
    averageTime: 12,
    maxTimeout: 300
  },

  'instant-id': {
    id: 'instant-id',
    type: 'ip-adapter',
    name: 'InstantID with IP-Adapter',
    version: 'latest',
    replicateId: 'zsxkib/instant-id',
    description: 'Advanced style transfer using IP-Adapter and ControlNet for better style blending.',
    capabilities: [
      {
        name: 'IP-Adapter',
        description: 'Image-based prompting for style and composition'
      },
      {
        name: 'ControlNet Integration',
        description: 'Maintains structure with Canny edge detection'
      },
      {
        name: 'Fine Control',
        description: 'Separate scales for structure vs style'
      }
    ],
    parameters: {
      required: [
        {
          name: 'image',
          type: 'file',
          description: 'Input image'
        },
        {
          name: 'prompt',
          type: 'string',
          description: 'Text prompt for generation'
        }
      ],
      optional: [
        {
          name: 'negative_prompt',
          type: 'string',
          description: 'Elements to avoid',
          default: ''
        },
        {
          name: 'ip_adapter_scale',
          type: 'number',
          description: 'Style transfer strength',
          min: 0,
          max: 1,
          default: 0.8
        },
        {
          name: 'controlnet_conditioning_scale',
          type: 'number',
          description: 'Structure preservation strength',
          min: 0,
          max: 1,
          default: 0.8
        },
        {
          name: 'guidance_scale',
          type: 'number',
          description: 'Overall guidance',
          min: 1,
          max: 10,
          default: 5
        },
        {
          name: 'num_inference_steps',
          type: 'number',
          description: 'Quality steps',
          min: 10,
          max: 50,
          default: 30
        }
      ],
      defaults: {
        negative_prompt: '',
        ip_adapter_scale: 0.8,
        controlnet_conditioning_scale: 0.8,
        guidance_scale: 5,
        num_inference_steps: 30,
        output_format: 'png'
      }
    },
    costPerRun: 0.01,
    averageTime: 15,
    maxTimeout: 300
  },

  'flux-canny-pro': {
    id: 'flux-canny-pro',
    type: 'canny-pro',
    name: 'FLUX Canny Pro',
    version: '3e03126bd3fbb9349783930f4139eb6c488aef2197c4d3fd2a826b35ccecea3d',
    replicateId: 'black-forest-labs/flux-canny-pro',
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
    replicateId: 'black-forest-labs/flux-1.1-pro',
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
  
  'flux-dev-inpainting': {
    id: 'flux-dev-inpainting',
    type: 'fill-pro',
    name: 'FLUX Dev Inpainting',
    version: 'ca8350ff748d56b3ebbd5a12bd3436c2214262a4ff8619de9890ecc41751a008',
    replicateId: 'black-forest-labs/flux-dev-inpainting',
    description: 'Professional inpainting for selective area editing using FLUX Dev model.',
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
          name: 'guidance_scale',
          type: 'number',
          description: 'Controls prompt adherence',
          min: 1,
          max: 10,
          default: 3.5
        },
        {
          name: 'num_inference_steps',
          type: 'number',
          description: 'Number of diffusion steps',
          min: 20,
          max: 50,
          default: 28
        },
        {
          name: 'strength',
          type: 'number',
          description: 'Inpainting strength',
          min: 0.1,
          max: 1,
          default: 0.95
        }
      ],
      defaults: {
        guidance_scale: 3.5,
        num_inference_steps: 28,
        strength: 0.95,
        output_format: 'jpg'
      }
    },
    costPerRun: 0.035,
    averageTime: 18,
    maxTimeout: 300
  },

  'flux-redux-dev': {
    id: 'flux-redux-dev',
    type: 'style-transfer',
    name: 'FLUX Redux Dev',
    version: '96b56814e57dfa601f3f524f82a2b336ef49012cda68828cb37cde66f481b7cb',
    replicateId: 'black-forest-labs/flux-redux-dev',
    description: 'Style transfer from reference images to create variations and apply specific aesthetics.',
    capabilities: [
      {
        name: 'Style Transfer',
        description: 'Transfer visual style from reference images'
      },
      {
        name: 'Material Transfer',
        description: 'Apply materials and finishes from references'
      },
      {
        name: 'Element Transfer',
        description: 'Transfer specific design elements and fixtures'
      }
    ],
    parameters: {
      required: [
        {
          name: 'redux_image',
          type: 'file',
          description: 'Reference image for style transfer'
        }
      ],
      optional: [
        {
          name: 'prompt',
          type: 'string',
          description: 'Additional guidance for the transfer',
          default: ''
        },
        {
          name: 'guidance',
          type: 'number',
          description: 'Guidance strength for style transfer',
          min: 0,
          max: 10,
          default: 3
        },
        {
          name: 'num_inference_steps',
          type: 'number',
          description: 'Number of diffusion steps',
          min: 1,
          max: 50,
          default: 28
        },
        {
          name: 'aspect_ratio',
          type: 'select',
          description: 'Output aspect ratio',
          options: ['1:1', '16:9', '21:9', '3:2', '2:3', '4:5', '5:4', '3:4', '4:3', '9:16', '9:21'],
          default: '16:9'
        },
        {
          name: 'megapixels',
          type: 'select',
          description: 'Output resolution',
          options: ['0.25', '1'],
          default: '1'
        }
      ],
      defaults: {
        guidance: 3,
        num_inference_steps: 28,
        aspect_ratio: '16:9',
        megapixels: '1',
        output_format: 'jpg',
        output_quality: 90
      }
    },
    costPerRun: 0.025,
    averageTime: 12,
    maxTimeout: 300
  },

  'flux-depth-dev': {
    id: 'flux-depth-dev',
    type: 'depth',
    name: 'FLUX Depth Dev',
    version: '97c293b16e4e42a3a5aae4d9b1cbdfacb99dca63d6c6a0e87810daef1ee37e72',
    replicateId: 'black-forest-labs/flux-depth-dev',
    description: 'Depth-aware image generation that automatically extracts depth maps for perspective-preserving transformations.',
    capabilities: [
      {
        name: 'Depth Preservation',
        description: 'Maintains spatial relationships and perspective'
      },
      {
        name: 'Empty Room Filling',
        description: 'Perfect for furnishing empty spaces'
      },
      {
        name: 'Automatic Depth Maps',
        description: 'No manual depth map required'
      }
    ],
    parameters: {
      required: [
        {
          name: 'control_image',
          type: 'file',
          description: 'Input image for depth extraction'
        },
        {
          name: 'prompt',
          type: 'string',
          description: 'Text description of desired output'
        }
      ],
      optional: [
        {
          name: 'guidance_scale',
          type: 'number',
          description: 'Controls prompt adherence',
          min: 1,
          max: 10,
          default: 3.5
        },
        {
          name: 'num_inference_steps',
          type: 'number',
          description: 'Number of diffusion steps',
          min: 1,
          max: 50,
          default: 28
        },
        {
          name: 'num_outputs',
          type: 'number',
          description: 'Number of outputs',
          min: 1,
          max: 4,
          default: 1
        }
      ],
      defaults: {
        guidance_scale: 3.5,
        num_inference_steps: 28,
        num_outputs: 1,
        output_format: 'webp',
        output_quality: 80
      }
    },
    costPerRun: 0.027,
    averageTime: 15,
    maxTimeout: 300
  },

  'flux-fill-pro': {
    id: 'flux-fill-pro',
    type: 'inpainting-pro',
    name: 'FLUX Fill Pro',
    version: '51c85098ba6e00bb65fbbdd3ce0cf0bf99b73e913b9a2f1c2c7f16091b5c71e2',
    replicateId: 'black-forest-labs/flux-fill-pro',
    description: 'Professional-grade inpainting and outpainting with advanced blending capabilities.',
    capabilities: [
      {
        name: 'Professional Inpainting',
        description: 'Seamless object replacement and editing'
      },
      {
        name: 'Outpainting',
        description: 'Extend images beyond original borders'
      },
      {
        name: 'Advanced Blending',
        description: 'Superior edge blending and context awareness'
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
    costPerRun: 0.05,
    averageTime: 20,
    maxTimeout: 300
  },

  'flux-1.1-pro-ultra': {
    id: 'flux-1.1-pro-ultra',
    type: 'flux-pro-ultra',
    name: 'FLUX 1.1 Pro Ultra',
    version: '4f5cb1b8b85078509ba1635c435b5861db12b21f3cf7c7c73eb72b7d99b5e6f0',
    replicateId: 'black-forest-labs/flux-1.1-pro-ultra',
    description: 'High-resolution 4MP image generation with image prompting capability for ultra-detailed outputs.',
    capabilities: [
      {
        name: '4 Megapixel Output',
        description: 'Generate ultra-high resolution images'
      },
      {
        name: 'Image Prompting',
        description: 'Use reference images to guide generation'
      },
      {
        name: 'Raw Mode',
        description: 'Photorealistic output option'
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
          name: 'image_prompt',
          type: 'file',
          description: 'Optional reference image for guidance'
        },
        {
          name: 'aspect_ratio',
          type: 'select',
          description: 'Output aspect ratio',
          options: ['1:1', '16:9', '21:9', '3:2', '2:3', '4:5', '5:4', '3:4', '4:3', '9:16', '9:21'],
          default: '16:9'
        },
        {
          name: 'safety_tolerance',
          type: 'number',
          description: 'Content safety level',
          min: 1,
          max: 6,
          default: 2
        },
        {
          name: 'raw',
          type: 'boolean',
          description: 'Enable raw photorealistic mode',
          default: false
        }
      ],
      defaults: {
        aspect_ratio: '16:9',
        safety_tolerance: 2,
        raw: false,
        output_format: 'jpg',
        output_quality: 95
      }
    },
    costPerRun: 0.06,
    averageTime: 25,
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