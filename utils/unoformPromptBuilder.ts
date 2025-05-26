/**
 * Unoform Intelligent Prompt Builder
 * Advanced prompt engineering system for kitchen design generation
 */

import { 
  UnoformStyle, 
  PromptBuildingContext, 
  PromptLayer,
  MaterialSelection,
  PromptEnhancement,
  StyleDefinition
} from '../types/unoform-styles';
import { 
  UNOFORM_STYLES, 
  STYLE_PROMPT_TEMPLATES,
  LIGHTING_ATMOSPHERE,
  MATERIAL_DESCRIPTIONS 
} from '../constants/unoform-styles';

/**
 * Core prompt building engine with model-aware optimization
 */
export class UnoformPromptBuilder {
  private context: PromptBuildingContext;
  private style: StyleDefinition;
  private layers: PromptLayer[] = [];

  constructor(context: PromptBuildingContext) {
    this.context = context;
    this.style = UNOFORM_STYLES[context.style];
    this.initializeLayers();
  }

  /**
   * Initialize the 5-layer prompt system
   */
  private initializeLayers(): void {
    // Layer 1: Core Identity
    this.layers.push({
      layer: 1,
      name: 'Core Identity',
      content: `${this.style.name} Unoform kitchen`,
      required: true
    });

    // Layer 2: Material/Finish
    this.layers.push({
      layer: 2,
      name: 'Material/Finish',
      content: this.buildMaterialLayer(),
      required: true
    });

    // Layer 3: Primary Features
    this.layers.push({
      layer: 3,
      name: 'Primary Features',
      content: this.buildFeaturesLayer(),
      required: true
    });

    // Layer 4: Supporting Details
    this.layers.push({
      layer: 4,
      name: 'Supporting Details',
      content: this.buildDetailsLayer(),
      required: false
    });

    // Layer 5: Context/Mood
    this.layers.push({
      layer: 5,
      name: 'Context/Mood',
      content: this.buildMoodLayer(),
      required: false
    });
  }

  /**
   * Build material description layer with rich visual descriptions
   */
  private buildMaterialLayer(): string {
    const { material } = this.context;
    
    // Check material compatibility
    if (!this.isMaterialCompatible(material)) {
      return this.getSuggestedMaterial();
    }

    // Get rich material description
    let materialDescription = material.name;
    
    // Try to get enhanced description from MATERIAL_DESCRIPTIONS
    if (material.type === 'wood' && MATERIAL_DESCRIPTIONS.woods[material.name as keyof typeof MATERIAL_DESCRIPTIONS.woods]) {
      materialDescription = MATERIAL_DESCRIPTIONS.woods[material.name as keyof typeof MATERIAL_DESCRIPTIONS.woods];
    } else if (material.type === 'paint') {
      // For paints, combine color with finish description
      const finishDesc = MATERIAL_DESCRIPTIONS.finishes[material.descriptor as keyof typeof MATERIAL_DESCRIPTIONS.finishes] || material.descriptor;
      materialDescription = `${material.name} with ${finishDesc}`;
    } else if (material.type === 'metal' && MATERIAL_DESCRIPTIONS.metals[material.name as keyof typeof MATERIAL_DESCRIPTIONS.metals]) {
      materialDescription = MATERIAL_DESCRIPTIONS.metals[material.name as keyof typeof MATERIAL_DESCRIPTIONS.metals];
    }

    // Build the material phrase
    const materialPhrase = material.type === 'wood' 
      ? `in ${materialDescription}`
      : material.type === 'paint'
      ? `painted in ${materialDescription}`
      : `with ${materialDescription} hardware`;

    // Add appearance descriptors if any
    if (material.appearance.length > 0) {
      return `${materialPhrase}, ${material.appearance.join(', ')}`;
    }

    return materialPhrase;
  }

  /**
   * Build features layer from style-specific descriptors with enhanced detail
   */
  private buildFeaturesLayer(): string {
    const features = this.context.features.length > 0 
      ? this.context.features 
      : this.getDefaultFeatures();

    // Enhance features with style-specific details
    const enhancedFeatures = features.map(feature => {
      // Try to find a more descriptive version in primaryDescriptors
      for (const [category, descriptors] of Object.entries(this.style.primaryDescriptors)) {
        if (Array.isArray(descriptors)) {
          const enhancedDesc = descriptors.find((desc: string) => 
            desc.toLowerCase().includes(feature.toLowerCase()) ||
            feature.toLowerCase().includes(desc.toLowerCase())
          );
          if (enhancedDesc) return enhancedDesc;
        }
      }
      return feature;
    });

    // Add style-specific critical features if missing
    const criticalFeatures = this.getCriticalStyleFeatures();
    criticalFeatures.forEach(cf => {
      if (!enhancedFeatures.some(f => f.includes(cf))) {
        enhancedFeatures.push(cf);
      }
    });

    // Model-specific optimizations
    if (this.context.modelType === 'canny-pro') {
      // For Canny Pro, emphasize structural elements
      return `with ${enhancedFeatures.slice(0, 3).join(', ')}, maintaining exact kitchen cabinet structure and layout`;
    } else {
      // For Flux Pro, allow more creative freedom
      return `featuring ${enhancedFeatures.join(', ')}`;
    }
  }

  /**
   * Build details layer
   */
  private buildDetailsLayer(): string {
    const details = this.context.details;
    if (details.length === 0) return '';

    // Filter details based on style requirements
    const validDetails = details.filter(detail => 
      this.isDetailValid(detail)
    );

    return validDetails.join(', ');
  }

  /**
   * Build mood/atmosphere layer with enhanced descriptions
   */
  private buildMoodLayer(): string {
    const { mood } = this.context;
    const moodElements: string[] = [];

    // Use enhanced lighting descriptions
    const lightingCategory = mood.lighting in LIGHTING_ATMOSPHERE.natural 
      ? 'natural' 
      : 'artificial';
    
    const lightingDesc = lightingCategory === 'natural'
      ? LIGHTING_ATMOSPHERE.natural[mood.lighting as keyof typeof LIGHTING_ATMOSPHERE.natural]
      : LIGHTING_ATMOSPHERE.artificial[mood.lighting as keyof typeof LIGHTING_ATMOSPHERE.artificial];
    
    if (lightingDesc) {
      moodElements.push(lightingDesc);
    } else {
      // Fallback to original mapping
      const lightingMap: Record<string, string> = {
        natural: 'bright Nordic daylight illuminating surfaces',
        ambient: 'warm ambient lighting throughout',
        dramatic: 'dramatic spotlighting emphasizing texture',
        even: 'even professional lighting'
      };
      moodElements.push(lightingMap[mood.lighting] || 'soft natural light');
    }

    // Use enhanced atmosphere descriptions
    const atmosphereDesc = LIGHTING_ATMOSPHERE.atmosphere[mood.atmosphere as keyof typeof LIGHTING_ATMOSPHERE.atmosphere];
    if (atmosphereDesc) {
      moodElements.push(atmosphereDesc);
    } else {
      // Fallback
      const atmosphereMap: Record<string, string> = {
        minimalist: 'pared-down essential minimalist atmosphere',
        warm: 'inviting cozy welcoming ambiance',
        sophisticated: 'refined elegant upscale environment',
        modern: 'contemporary fresh modern aesthetic'
      };
      moodElements.push(atmosphereMap[mood.atmosphere] || 'Scandinavian atmosphere');
    }

    // Time of day (optional) - enhanced
    if (mood.timeOfDay) {
      const timeEnhancements: Record<string, string> = {
        morning: 'soft morning light filtering through windows',
        afternoon: 'bright Nordic afternoon illumination',
        evening: 'warm golden hour glow'
      };
      moodElements.push(timeEnhancements[mood.timeOfDay] || '');
    }

    // Add professional photography element for quality
    moodElements.push('professional architectural photography');

    return moodElements.filter(e => e).join(', ');
  }

  /**
   * Generate the final optimized prompt
   */
  public buildPrompt(): string {
    const promptParts = this.layers
      .filter(layer => layer.required || layer.content.length > 0)
      .map(layer => layer.content)
      .filter(content => content.length > 0);

    let basePrompt = promptParts.join(', ');

    // Apply model-specific optimizations
    basePrompt = this.applyModelOptimizations(basePrompt);

    // Apply style-specific enhancements
    basePrompt = this.applyStyleEnhancements(basePrompt);

    // Apply brand consistency
    basePrompt = this.ensureBrandConsistency(basePrompt);

    return basePrompt;
  }

  /**
   * Model-specific prompt optimizations
   */
  private applyModelOptimizations(prompt: string): string {
    if (this.context.modelType === 'canny-pro') {
      // Canny Pro optimizations
      const structuralKeywords = [
        'maintaining kitchen layout',
        'preserving cabinet arrangement',
        'keeping spatial configuration'
      ];
      
      // Add structural preservation hint if not present
      if (!structuralKeywords.some(kw => prompt.includes(kw))) {
        prompt += ', maintaining original kitchen structure and layout';
      }

      // Emphasize material changes over structural changes
      prompt = prompt.replace(/featuring/g, 'updating materials to');
      
    } else {
      // Flux Pro 1.1 optimizations
      // Ensure proper aspect ratio mention
      if (!prompt.includes('16:9') && !prompt.includes('wide format')) {
        prompt += ', in 16:9 wide kitchen interior format';
      }

      // Add creativity enhancers
      const creativityEnhancers = [
        'professional interior photography',
        'architectural digest quality',
        'high-end kitchen showroom'
      ];
      
      const randomEnhancer = creativityEnhancers[Math.floor(Math.random() * creativityEnhancers.length)];
      prompt += `, ${randomEnhancer}`;
    }

    return prompt;
  }

  /**
   * Style-specific prompt enhancements
   */
  private applyStyleEnhancements(prompt: string): string {
    // Add style-specific keywords that might be missing
    const requiredKeywords = this.getRequiredKeywords();
    
    requiredKeywords.forEach(keyword => {
      if (!prompt.toLowerCase().includes(keyword.toLowerCase())) {
        prompt = this.insertKeywordNaturally(prompt, keyword);
      }
    });

    return prompt;
  }

  /**
   * Ensure Unoform brand consistency
   */
  private ensureBrandConsistency(prompt: string): string {
    // Always end with brand reinforcement
    const brandReinforcements = [
      'Danish kitchen design excellence',
      'Scandinavian craftsmanship',
      'Nordic design philosophy',
      'Unoform signature quality'
    ];

    if (!brandReinforcements.some(br => prompt.includes(br))) {
      const reinforcement = brandReinforcements[Math.floor(Math.random() * brandReinforcements.length)];
      prompt += `, ${reinforcement}`;
    }

    return prompt;
  }

  /**
   * Get required keywords for the current style
   */
  private getRequiredKeywords(): string[] {
    const keywords: string[] = [];
    
    // Extract keywords from must-have rules
    this.style.validation.mustHave.forEach(rule => {
      keywords.push(...rule.keywords.slice(0, 2)); // Take first 2 keywords from each rule
    });

    return Array.from(new Set(keywords)); // Remove duplicates
  }

  /**
   * Insert a keyword naturally into the prompt
   */
  private insertKeywordNaturally(prompt: string, keyword: string): string {
    // Find the best insertion point based on context
    if (keyword.includes('slat') || keyword.includes('frame')) {
      // Insert after material description
      const materialMatch = prompt.match(/in [^,]+/);
      if (materialMatch) {
        const insertPoint = materialMatch.index! + materialMatch[0].length;
        return prompt.slice(0, insertPoint) + ` ${keyword}` + prompt.slice(insertPoint);
      }
    }
    
    // Default: add before mood layer
    const moodKeywords = ['lighting', 'aesthetic', 'atmosphere'];
    const moodIndex = moodKeywords.reduce((minIndex, mk) => {
      const index = prompt.indexOf(mk);
      return index !== -1 && (minIndex === -1 || index < minIndex) ? index : minIndex;
    }, -1);

    if (moodIndex !== -1) {
      return prompt.slice(0, moodIndex) + `${keyword}, ` + prompt.slice(moodIndex);
    }

    // Fallback: add to features section
    return prompt.replace(/with /, `with ${keyword}, `);
  }

  /**
   * Get critical features that must be present for each style
   */
  private getCriticalStyleFeatures(): string[] {
    const styleFeatures: Record<UnoformStyle, string[]> = {
      classic: ['horizontal slatted drawer fronts', 'thick frames surrounding drawers', 'high recessed plinth'],
      copenhagen: ['exposed drawer boxes', 'visible corner joints', 'wide gaps between modules'],
      shaker: ['frame-and-panel doors', 'recessed center panels', 'small hardware'],
      avantgarde: ['completely flat surfaces', 'hairline gaps', 'no visible handles']
    };
    
    return styleFeatures[this.context.style] || [];
  }

  /**
   * Generate prompt using style templates
   */
  public buildFromTemplate(detailed: boolean = true): string {
    const styleKey = this.context.style;
    const template = detailed 
      ? STYLE_PROMPT_TEMPLATES[styleKey].detailed
      : STYLE_PROMPT_TEMPLATES[styleKey].basic;
    
    // Replace template variables
    let prompt = template;
    
    // Replace material placeholders
    prompt = prompt.replace(/{wood}/g, this.context.material.name);
    prompt = prompt.replace(/{material}/g, this.context.material.name);
    prompt = prompt.replace(/{finish}/g, this.context.material.descriptor || 'matte');
    prompt = prompt.replace(/{color}/g, this.context.material.name);
    
    // Replace feature placeholders
    prompt = prompt.replace(/{number}/g, 'three');
    prompt = prompt.replace(/{jointType}/g, 'dovetail');
    prompt = prompt.replace(/{mounting}/g, 'slender steel legs');
    prompt = prompt.replace(/{hardware}/g, 'small brass knob');
    prompt = prompt.replace(/{height}/g, 'floor-to-ceiling');
    
    // Replace countertop
    const countertop = this.style.materialCompatibility.countertops[0] || 'quartz';
    prompt = prompt.replace(/{countertop}/g, countertop);
    
    // Replace lighting
    const lighting = LIGHTING_ATMOSPHERE.natural[this.context.mood.lighting as keyof typeof LIGHTING_ATMOSPHERE.natural] || 
                    'bright Scandinavian daylight';
    prompt = prompt.replace(/{lighting}/g, lighting);
    
    return prompt;
  }

  /**
   * Check if material is compatible with style
   */
  private isMaterialCompatible(material: MaterialSelection): boolean {
    const compatibility = this.style.materialCompatibility;
    
    switch (material.type) {
      case 'wood':
        return compatibility.woods.some(wood => 
          wood.toLowerCase().includes(material.name.toLowerCase()) ||
          material.name.toLowerCase().includes(wood.split(' ')[0].toLowerCase())
        );
      case 'paint':
        return compatibility.paints.some(paint => 
          paint.toLowerCase().includes(material.name.toLowerCase()) ||
          material.name.toLowerCase().includes(paint.split(' ')[0].toLowerCase())
        );
      case 'metal':
        return compatibility.metals.some(metal => 
          metal.toLowerCase().includes(material.name.toLowerCase()) ||
          material.name.toLowerCase().includes(metal.split(' ')[0].toLowerCase())
        );
      default:
        return true;
    }
  }

  /**
   * Get suggested material if incompatible with enhanced descriptions
   */
  private getSuggestedMaterial(): string {
    const { woods, paints } = this.style.materialCompatibility;
    
    if (woods.length > 0) {
      // Try to get enhanced wood description
      const woodName = woods[0].split(' ')[0]; // Extract base wood name
      const woodDesc = MATERIAL_DESCRIPTIONS.woods[woodName as keyof typeof MATERIAL_DESCRIPTIONS.woods];
      return woodDesc ? `in ${woodDesc}` : `in ${woods[0]}`;
    } else if (paints.length > 0) {
      // For paints, use the paint with a finish description
      const paintColor = paints[0];
      const defaultFinish = (this.style.materialCompatibility as any).paintFinishes?.matte || 'velvety matte finish';
      return `painted in ${paintColor} with ${defaultFinish}`;
    }
    
    return 'in premium Scandinavian materials';
  }

  /**
   * Get default features for style with enhanced descriptions
   */
  private getDefaultFeatures(): string[] {
    // Select key features based on style
    const styleKey = this.context.style;
    const allFeatures: string[] = [];
    
    // Prioritize certain descriptor categories based on style
    const priorityMap: Record<UnoformStyle, string[]> = {
      classic: ['drawerFronts', 'shadows', 'frames', 'base'],
      copenhagen: ['exposure', 'construction', 'gaps', 'support'],
      shaker: ['doors', 'frames', 'hardware', 'proportions'],
      avantgarde: ['surfaces', 'gaps', 'effect', 'hardware']
    };
    
    const priorities = priorityMap[styleKey] || [];
    
    // Get features in priority order
    priorities.forEach(category => {
      const descriptors = this.style.primaryDescriptors[category];
      if (Array.isArray(descriptors)) {
        allFeatures.push(...descriptors.slice(0, 1));
      } else if (typeof descriptors === 'object' && descriptors && 'type' in descriptors) {
        allFeatures.push((descriptors as any).type);
      }
    });

    // Fill with other features if needed
    if (allFeatures.length < 3) {
      Object.entries(this.style.primaryDescriptors).forEach(([key, value]) => {
        if (!priorities.includes(key) && Array.isArray(value)) {
          allFeatures.push(...value.slice(0, 1));
        }
      });
    }

    return allFeatures.slice(0, 4); // Return 4 features for richness
  }

  /**
   * Validate if detail is appropriate for style
   */
  private isDetailValid(detail: string): boolean {
    // Check against must-not-have rules
    return !this.style.validation.mustNotHave.some(rule =>
      rule.keywords.some(keyword => 
        detail.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }

  /**
   * Get enhancement report
   */
  public getEnhancementReport(originalPrompt: string): PromptEnhancement {
    const enhanced = this.buildPrompt();
    
    // Analyze differences
    const additions: string[] = [];
    const removals: string[] = [];
    const modelOptimizations: string[] = [];

    // Find additions
    enhanced.split(',').forEach(part => {
      if (!originalPrompt.includes(part.trim())) {
        additions.push(part.trim());
      }
    });

    // Find model-specific optimizations
    if (this.context.modelType === 'canny-pro') {
      modelOptimizations.push('Added structure preservation keywords');
      modelOptimizations.push('Emphasized material updates over layout changes');
    } else {
      modelOptimizations.push('Added aspect ratio optimization');
      modelOptimizations.push('Included quality enhancers');
    }

    return {
      original: originalPrompt,
      enhanced,
      additions,
      removals,
      modelOptimizations
    };
  }
}

/**
 * Convenience function to build prompts
 */
export function buildUnoformPrompt(context: PromptBuildingContext): string {
  const builder = new UnoformPromptBuilder(context);
  return builder.buildPrompt();
}

/**
 * Analyze and enhance existing prompts
 */
export function enhanceExistingPrompt(
  prompt: string, 
  style: UnoformStyle,
  modelType: 'canny-pro' | 'flux-pro'
): PromptEnhancement {
  // Parse the existing prompt to extract context
  const context = parsePromptToContext(prompt, style, modelType);
  const builder = new UnoformPromptBuilder(context);
  return builder.getEnhancementReport(prompt);
}

/**
 * Parse existing prompt to context (helper function)
 */
function parsePromptToContext(
  _prompt: string, 
  style: UnoformStyle,
  modelType: 'canny-pro' | 'flux-pro'
): PromptBuildingContext {
  // Basic parsing - can be enhanced
  return {
    style,
    material: {
      type: 'wood',
      name: 'oak',
      descriptor: 'natural',
      appearance: []
    },
    features: [],
    details: [],
    mood: {
      lighting: 'natural',
      atmosphere: 'minimalist'
    },
    modelType
  };
}