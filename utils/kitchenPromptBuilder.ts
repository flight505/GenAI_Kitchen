/**
 * Comprehensive Kitchen Prompt Builder
 * Generates detailed prompts from kitchen design selections
 */

import { KitchenDesignSelections } from '../components/design/KitchenDesignSelector';

// Material Visual Descriptions
const MATERIAL_DESCRIPTIONS: Record<string, Record<string, string>> = {
  worktop: {
    'Belvedere Quartzite': 'white surface with dramatic grey veining flowing like smoke',
    'Taj Mahal Quartzite': 'warm beige stone with subtle golden undertones and gentle movement',
    'Mont Blanc Quartzite': 'pure white with delicate thin grey lines',
    'Fusion Quartzite': 'dramatic black base with bold white lightning strikes',
    'Sea Pearl Quartzite': 'grey-green with pearlescent shimmer and oceanic waves',
    'Calacatta Marble': 'white marble with bold grey and gold veining',
    'Absolute Black Granite': 'pure jet black with no pattern',
    'Black Pearl Granite': 'black with silver flecks that sparkle',
    'Kashmir White Granite': 'cream base with burgundy and grey speckles',
    'Solid Oak': 'golden honey wood with visible grain',
    'Solid Walnut': 'rich chocolate brown wood with natural patterns',
    'Concrete': 'industrial grey with subtle texture',
    'White Composite': 'pure white engineered surface'
  },
  
  finishes: {
    'Polished': 'mirror-like reflective shine',
    'Honed': 'smooth matte finish without shine',
    'Leathered': 'textured surface with natural feel',
    'Oiled': 'natural wood finish enhancing grain'
  },
  
  edges: {
    'Straight': 'clean sharp modern edge',
    'Eased': 'slightly softened edge corners',
    'Bullnose': 'fully rounded soft edge',
    'Waterfall': 'dramatic continuation to floor'
  }
};

export class KitchenPromptBuilder {
  private selections: KitchenDesignSelections;

  constructor(selections: KitchenDesignSelections) {
    this.selections = selections;
  }

  public generatePrompt(): string {
    const parts: string[] = [];
    
    // 1. Base Unoform Style
    parts.push(`${this.selections.cabinetStyle} Unoform kitchen`);
    
    // 2. Cabinet Description
    const cabinetDesc = this.getCabinetDescription();
    parts.push(cabinetDesc);
    
    // 3. Worktop Description
    const worktopDesc = this.getWorktopDescription();
    parts.push(worktopDesc);
    
    // 4. Backsplash Description
    const backsplashDesc = this.getBacksplashDescription();
    if (backsplashDesc) parts.push(backsplashDesc);
    
    // 5. Appliance Description
    const applianceDesc = this.getApplianceDescription();
    parts.push(applianceDesc);
    
    // 6. Layout Elements
    const layoutDesc = this.getLayoutDescription();
    if (layoutDesc) parts.push(layoutDesc);
    
    // 7. Environmental Elements
    parts.push(`${this.selections.flooring.toLowerCase()} flooring`);
    parts.push(`${this.selections.wallColor.toLowerCase()} walls`);
    
    // 8. Lighting and Atmosphere
    parts.push(this.getLightingDescription());
    
    // 9. Style Reinforcement
    parts.push('Danish minimalist design, professional architectural photography');
    
    return parts.join(', ');
  }

  private getCabinetDescription(): string {
    const { cabinetStyle, cabinetMaterial, cabinetColor, hardware } = this.selections;
    
    let baseDesc = '';
    
    // Style-specific features
    switch (cabinetStyle) {
      case 'Classic':
        baseDesc = 'horizontal slatted drawer fronts with shadow gaps, thick frames around modules, floating on high dark plinth';
        break;
      case 'Copenhagen':
        baseDesc = 'exposed drawer boxes without fronts, visible corner joints, mounted on steel legs';
        break;
      case 'Shaker':
        baseDesc = 'frame and panel doors with recessed centers, traditional proportions';
        break;
      case 'Avantgarde':
        baseDesc = 'completely flat seamless surfaces, hairline gaps creating grid, no visible hardware';
        break;
    }
    
    // Material description
    let materialDesc = '';
    if (cabinetMaterial === 'Painted' && cabinetColor) {
      materialDesc = `in ${cabinetColor.toLowerCase()} matte paint`;
    } else {
      const woodDescriptions: Record<string, string> = {
        'White Oak': 'in light golden oak with straight grain',
        'Walnut': 'in rich dark walnut with swirling grain',
        'Ash': 'in pale blonde ash with subtle grain',
        'Smoked Oak': 'in grey-brown weathered oak',
        'Black Oak': 'in deep ebony stained oak'
      };
      materialDesc = woodDescriptions[cabinetMaterial] || `in ${cabinetMaterial.toLowerCase()}`;
    }
    
    // Hardware description
    const hardwareDesc = hardware === 'None (Handleless)' 
      ? 'handleless design' 
      : `with ${hardware.toLowerCase()}`;
    
    return `${materialDesc} ${baseDesc}, ${hardwareDesc}`;
  }

  private getWorktopDescription(): string {
    const { worktopMaterial, worktopFinish, worktopEdge, worktopThickness } = this.selections;
    
    const materialDesc = MATERIAL_DESCRIPTIONS.worktop[worktopMaterial] || worktopMaterial.toLowerCase();
    const finishDesc = MATERIAL_DESCRIPTIONS.finishes[worktopFinish];
    const edgeDesc = MATERIAL_DESCRIPTIONS.edges[worktopEdge];
    
    return `${worktopThickness.toLowerCase()} worktop in ${materialDesc} with ${finishDesc} and ${edgeDesc}`;
  }

  private getBacksplashDescription(): string {
    const { backsplashType, backsplashMaterial, backsplashPattern } = this.selections;
    
    if (backsplashType === 'None') return '';
    
    let heightDesc = '';
    switch (backsplashType) {
      case 'Standard Height':
        heightDesc = 'standard height';
        break;
      case 'Full Height':
        heightDesc = 'full height extending to upper cabinets';
        break;
      case 'Window Surround':
        heightDesc = 'surrounding kitchen window';
        break;
      case 'Ledge Only':
        heightDesc = 'minimal ledge';
        break;
    }
    
    const materialDesc = backsplashMaterial === 'Match Worktop' 
      ? 'matching worktop material' 
      : backsplashMaterial.toLowerCase();
    
    const patternDesc = backsplashPattern && backsplashPattern !== 'Standard'
      ? ` in ${backsplashPattern.toLowerCase()} pattern`
      : '';
    
    return `${heightDesc} backsplash in ${materialDesc}${patternDesc}`;
  }

  private getApplianceDescription(): string {
    const { applianceStrategy, applianceFinish } = this.selections;
    
    const strategies: Record<string, string> = {
      'Keep All Existing': 'keeping existing appliances',
      'Update to Integrated': `integrated appliances with ${applianceFinish.toLowerCase()} finish`,
      'Update to Professional': `professional-grade ${applianceFinish.toLowerCase()} appliances`,
      'Remove Upper Appliances': 'minimal visible appliances, clean upper areas',
      'Minimal Visible': 'fully integrated hidden appliances'
    };
    
    return strategies[applianceStrategy] || applianceStrategy.toLowerCase();
  }

  private getLayoutDescription(): string {
    const { layoutElements } = this.selections;
    const elements: string[] = [];
    
    if (layoutElements.island) elements.push('central island');
    if (layoutElements.peninsula) elements.push('peninsula configuration');
    if (layoutElements.openShelving) elements.push('open shelving sections');
    if (!layoutElements.upperCabinets) elements.push('no upper cabinets for open feel');
    if (layoutElements.tallCabinets) elements.push('floor-to-ceiling storage');
    if (layoutElements.windowAboveSink) elements.push('window above sink area');
    
    return elements.length > 0 ? `with ${elements.join(', ')}` : '';
  }

  private getLightingDescription(): string {
    const lightingMap: Record<string, string> = {
      'Minimal Recessed': 'subtle recessed lighting',
      'Statement Pendants': 'dramatic pendant lights over island',
      'Under Cabinet LED': 'warm under-cabinet LED strips',
      'Track Lighting': 'adjustable track lighting',
      'Natural Light Focus': 'bright natural daylight'
    };
    
    return lightingMap[this.selections.lightingStyle] || this.selections.lightingStyle.toLowerCase();
  }

  // Helper method to extract key metadata
  public getMetadata() {
    return {
      style: this.selections.cabinetStyle,
      material: this.selections.cabinetMaterial === 'Painted' 
        ? `${this.selections.cabinetColor} ${this.selections.cabinetMaterial}`
        : this.selections.cabinetMaterial,
      worktop: this.selections.worktopMaterial,
      hardware: this.selections.hardware,
      finish: this.selections.worktopFinish,
      backsplash: this.selections.backsplashType !== 'None' 
        ? `${this.selections.backsplashType} - ${this.selections.backsplashMaterial}`
        : 'None'
    };
  }

  // Analyze prompt complexity
  public analyzePrompt(): {
    tokenEstimate: number;
    keyElements: string[];
    warnings: string[];
  } {
    const prompt = this.generatePrompt();
    const tokenEstimate = Math.ceil(prompt.length / 4); // Rough estimate
    
    const keyElements: string[] = [];
    const warnings: string[] = [];

    // Identify key elements
    keyElements.push(`Style: ${this.selections.cabinetStyle}`);
    keyElements.push(`Cabinet: ${this.selections.cabinetMaterial}`);
    keyElements.push(`Worktop: ${this.selections.worktopMaterial}`);
    
    if (this.selections.backsplashType !== 'None') {
      keyElements.push(`Backsplash: ${this.selections.backsplashType}`);
    }

    // Check for potential conflicts
    if (this.selections.cabinetStyle === 'Avantgarde' && 
        this.selections.hardware !== 'None (Handleless)' && 
        this.selections.hardware !== 'Integrated Grip') {
      warnings.push('Avantgarde style typically uses handleless design');
    }

    if (this.selections.worktopMaterial.includes('Wood') && 
        this.selections.worktopFinish !== 'Oiled') {
      warnings.push('Wood worktops are typically oiled, not polished');
    }

    return { tokenEstimate, keyElements, warnings };
  }
}