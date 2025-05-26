// utils/kitchenTypes.ts - Enhanced version with worktop, backsplash, and appliances

export interface KitchenDesignSelections {
  // Unoform Cabinet Styles
  cabinetStyle: 
    | 'Classic' 
    | 'Copenhagen' 
    | 'Shaker' 
    | 'Avantgarde';
  
  // Cabinet Material/Finish
  cabinetMaterial: 
    | 'White Oak'
    | 'Walnut' 
    | 'Ash'
    | 'Smoked Oak'
    | 'Black Oak'
    | 'Painted';
  
  // Paint colors (if painted)
  cabinetColor?: 
    | 'Glacier White'
    | 'Cream White'
    | 'Sage Green'
    | 'Kieselgrau'
    | 'Steingrau'
    | 'Olive'
    | 'Charcoal'
    | 'Matte Black';
  
  // Hardware
  hardware: 
    | 'None (Handleless)'
    | 'Brass Knobs'
    | 'Black Metal Handles'
    | 'Steel Bar Pulls'
    | 'Integrated Grip';
  
  // Worktop Material
  worktopMaterial:
    | 'Belvedere Quartzite'
    | 'Taj Mahal Quartzite'
    | 'Mont Blanc Quartzite'
    | 'Fusion Quartzite'
    | 'Sea Pearl Quartzite'
    | 'Calacatta Marble'
    | 'Absolute Black Granite'
    | 'Black Pearl Granite'
    | 'Kashmir White Granite'
    | 'Solid Oak'
    | 'Solid Walnut'
    | 'Concrete'
    | 'White Composite';
  
  // Worktop Details
  worktopFinish: 'Polished' | 'Honed' | 'Leathered' | 'Oiled';
  worktopEdge: 'Straight' | 'Eased' | 'Bullnose' | 'Waterfall';
  worktopThickness: 'Slim' | 'Standard' | 'Chunky';
  
  // Backsplash Configuration
  backsplashType: 
    | 'None'
    | 'Standard Height'
    | 'Full Height'
    | 'Window Surround'
    | 'Ledge Only';
  
  backsplashMaterial:
    | 'Match Worktop'
    | 'Contrasting Stone'
    | 'Subway Tile'
    | 'Large Format Tile'
    | 'Glass'
    | 'Metal';
  
  backsplashPattern?:
    | 'Standard'
    | 'Bookmatched'
    | 'Herringbone'
    | 'Vertical Stack';
  
  // Appliance Handling
  applianceStrategy:
    | 'Keep All Existing'
    | 'Update to Integrated'
    | 'Update to Professional'
    | 'Remove Upper Appliances'
    | 'Minimal Visible';
  
  applianceFinish:
    | 'Stainless Steel'
    | 'Black Stainless'
    | 'Matte Black'
    | 'Integrated Panels'
    | 'White';
  
  // Kitchen Layout Elements
  layoutElements: {
    island: boolean;
    peninsula: boolean;
    openShelving: boolean;
    upperCabinets: boolean;
    tallCabinets: boolean;
    windowAboveSink: boolean;
  };
  
  // Flooring (affects overall look)
  flooring: 
    | 'Light Wood'
    | 'Dark Wood'
    | 'Herringbone Wood'
    | 'Large Tiles'
    | 'Concrete'
    | 'Natural Stone';
  
  // Wall Treatment
  wallColor:
    | 'Bright White'
    | 'Warm White'
    | 'Light Grey'
    | 'Beige'
    | 'Sage'
    | 'Charcoal';
  
  // Lighting Style
  lightingStyle:
    | 'Minimal Recessed'
    | 'Statement Pendants'
    | 'Under Cabinet LED'
    | 'Track Lighting'
    | 'Natural Light Focus';
}

// Material Visual Descriptions
export const MATERIAL_DESCRIPTIONS = {
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

// Enhanced prompt generation function
export function generatePromptFromSelections(selections: KitchenDesignSelections): string {
  const parts: string[] = [];
  
  // 1. Base Unoform Style
  parts.push(`${selections.cabinetStyle} Unoform kitchen`);
  
  // 2. Cabinet Description
  const cabinetDesc = getCabinetDescription(selections);
  parts.push(cabinetDesc);
  
  // 3. Worktop Description
  const worktopDesc = getWorktopDescription(selections);
  parts.push(worktopDesc);
  
  // 4. Backsplash Description
  const backsplashDesc = getBacksplashDescription(selections);
  if (backsplashDesc) parts.push(backsplashDesc);
  
  // 5. Appliance Description
  const applianceDesc = getApplianceDescription(selections);
  parts.push(applianceDesc);
  
  // 6. Layout Elements
  const layoutDesc = getLayoutDescription(selections);
  if (layoutDesc) parts.push(layoutDesc);
  
  // 7. Environmental Elements
  parts.push(`${selections.flooring} flooring`);
  parts.push(`${selections.wallColor} walls`);
  
  // 8. Lighting and Atmosphere
  parts.push(getLightingDescription(selections));
  
  // 9. Style Reinforcement
  parts.push('Danish minimalist design, professional architectural photography');
  
  return parts.join(', ');
}

// Helper functions for detailed descriptions
function getCabinetDescription(selections: KitchenDesignSelections): string {
  const { cabinetStyle, cabinetMaterial, cabinetColor, hardware } = selections;
  
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

function getWorktopDescription(selections: KitchenDesignSelections): string {
  const { worktopMaterial, worktopFinish, worktopEdge, worktopThickness } = selections;
  
  const materialDesc = MATERIAL_DESCRIPTIONS.worktop[worktopMaterial] || worktopMaterial.toLowerCase();
  const finishDesc = MATERIAL_DESCRIPTIONS.finishes[worktopFinish];
  const edgeDesc = MATERIAL_DESCRIPTIONS.edges[worktopEdge];
  
  return `${worktopThickness.toLowerCase()} worktop in ${materialDesc} with ${finishDesc} and ${edgeDesc}`;
}

function getBacksplashDescription(selections: KitchenDesignSelections): string {
  const { backsplashType, backsplashMaterial, backsplashPattern } = selections;
  
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

function getApplianceDescription(selections: KitchenDesignSelections): string {
  const { applianceStrategy, applianceFinish } = selections;
  
  const strategies: Record<string, string> = {
    'Keep All Existing': 'keeping existing appliances',
    'Update to Integrated': `integrated appliances with ${applianceFinish.toLowerCase()} finish`,
    'Update to Professional': `professional-grade ${applianceFinish.toLowerCase()} appliances`,
    'Remove Upper Appliances': 'minimal visible appliances, clean upper areas',
    'Minimal Visible': 'fully integrated hidden appliances'
  };
  
  return strategies[applianceStrategy] || applianceStrategy.toLowerCase();
}

function getLayoutDescription(selections: KitchenDesignSelections): string {
  const { layoutElements } = selections;
  const elements: string[] = [];
  
  if (layoutElements.island) elements.push('central island');
  if (layoutElements.peninsula) elements.push('peninsula configuration');
  if (layoutElements.openShelving) elements.push('open shelving sections');
  if (!layoutElements.upperCabinets) elements.push('no upper cabinets for open feel');
  if (layoutElements.tallCabinets) elements.push('floor-to-ceiling storage');
  if (layoutElements.windowAboveSink) elements.push('window above sink area');
  
  return elements.length > 0 ? `with ${elements.join(', ')}` : '';
}

function getLightingDescription(selections: KitchenDesignSelections): string {
  const lightingMap: Record<string, string> = {
    'Minimal Recessed': 'subtle recessed lighting',
    'Statement Pendants': 'dramatic pendant lights over island',
    'Under Cabinet LED': 'warm under-cabinet LED strips',
    'Track Lighting': 'adjustable track lighting',
    'Natural Light Focus': 'bright natural daylight'
  };
  
  return lightingMap[selections.lightingStyle] || selections.lightingStyle.toLowerCase();
}

// Preset combinations for quick selection
export const PRESET_COMBINATIONS = {
  'Modern Minimalist': {
    cabinetStyle: 'Avantgarde',
    cabinetMaterial: 'Painted',
    cabinetColor: 'Matte Black',
    worktopMaterial: 'Calacatta Marble',
    worktopFinish: 'Polished',
    backsplashType: 'Full Height',
    applianceStrategy: 'Update to Integrated'
  },
  'Scandinavian Warm': {
    cabinetStyle: 'Classic',
    cabinetMaterial: 'White Oak',
    worktopMaterial: 'Taj Mahal Quartzite',
    worktopFinish: 'Honed',
    backsplashType: 'Standard Height',
    applianceStrategy: 'Keep All Existing'
  },
  'Traditional Elegance': {
    cabinetStyle: 'Shaker',
    cabinetMaterial: 'Painted',
    cabinetColor: 'Sage Green',
    worktopMaterial: 'Kashmir White Granite',
    worktopFinish: 'Polished',
    backsplashType: 'Full Height',
    applianceStrategy: 'Update to Professional'
  }
};