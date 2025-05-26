/**
 * Unoform Style Definitions
 * Complete style system with validation rules and prompt formulas
 */

import { StyleDefinition, UnoformStyle } from '../types/unoform-styles';

export const UNOFORM_STYLES: Record<UnoformStyle, StyleDefinition> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Cubic modules with horizontal slatted drawer fronts, thick wooden frames, and notably high dark recessed base creating strong shadow lines. Features uniform drawer units with handleless design and carved grip detail.',
    validation: {
      mustHave: [
        {
          category: 'mustHave',
          description: 'Horizontal wood slats/strips on drawer fronts',
          keywords: ['horizontal slats', 'slatted', 'wood strips', 'parallel strips'],
          visualMarkers: ['horizontal lines', 'striped pattern']
        },
        {
          category: 'mustHave',
          description: 'Visible shadow gaps between each slat',
          keywords: ['shadow gaps', 'fine gaps', 'dark lines', 'shadow grooves'],
          visualMarkers: ['dark horizontal lines', 'rhythm']
        },
        {
          category: 'mustHave',
          description: 'Thick frame surrounding each drawer group',
          keywords: ['thick frames', 'wooden borders', 'substantial frames'],
          visualMarkers: ['prominent borders', 'module definition']
        },
        {
          category: 'mustHave',
          description: 'High base/plinth creating shadow at floor',
          keywords: ['high plinth', 'floating base', 'elevated', 'shadow beneath'],
          visualMarkers: ['floor gap', 'shadow line']
        },
        {
          category: 'mustHave',
          description: 'Multiple identical drawers stacked (3-4 per module)',
          keywords: ['stacked drawers', 'three drawers', 'four drawers', 'identical height'],
          visualMarkers: ['repetition', 'uniform spacing']
        },
        {
          category: 'mustHave',
          description: 'No visible handles or hardware',
          keywords: ['handleless', 'integrated pulls', 'no hardware', 'clean fronts'],
          visualMarkers: ['smooth surfaces', 'uninterrupted lines']
        }
      ],
      shouldHave: [
        {
          category: 'shouldHave',
          description: 'Clear module separation',
          keywords: ['separate modules', 'module gaps', 'distinct units'],
          visualMarkers: ['vertical gaps', 'individual units']
        },
        {
          category: 'shouldHave',
          description: 'Consistent slat alignment across modules',
          keywords: ['aligned slats', 'continuous lines', 'matching pattern'],
          visualMarkers: ['horizontal continuity']
        },
        {
          category: 'shouldHave',
          description: 'Natural wood grain visible',
          keywords: ['wood grain', 'natural texture', 'grain pattern'],
          visualMarkers: ['texture variation', 'organic patterns']
        },
        {
          category: 'shouldHave',
          description: 'Dark/contrasting countertop',
          keywords: ['dark stone', 'black countertop', 'contrasting surface'],
          visualMarkers: ['color contrast', 'dark horizontal plane']
        }
      ],
      mustNotHave: [
        {
          category: 'mustNotHave',
          description: 'Visible handles or knobs',
          keywords: ['handles', 'knobs', 'pulls', 'hardware'],
          visualMarkers: ['protruding elements']
        },
        {
          category: 'mustNotHave',
          description: 'Curved or rounded elements',
          keywords: ['curved', 'rounded', 'arched', 'organic shapes'],
          visualMarkers: ['curves', 'non-linear elements']
        },
        {
          category: 'mustNotHave',
          description: 'Drawer fronts without slats',
          keywords: ['flat fronts', 'smooth drawers', 'plain surfaces'],
          visualMarkers: ['unbroken surfaces']
        },
        {
          category: 'mustNotHave',
          description: 'Base that touches floor',
          keywords: ['floor-mounted', 'no gap', 'grounded'],
          visualMarkers: ['no shadow line']
        }
      ]
    },
    promptFormula: 'Classic Unoform kitchen with horizontal slatted [material] drawer fronts, thin shadow gaps between each slat creating rhythmic pattern, thick [material] frames surrounding slatted drawer fronts, high recessed [color] base creating deep shadow at floor, [number] equal-height drawers stacked per cubic module, handleless design with routed grip carved into top edge, [worktop] countertop, professional architectural photography',
    primaryDescriptors: {
      drawerFronts: ['horizontal slatted drawer fronts', 'parallel wood strips with shadow gaps', 'linear wood pattern', 'striped texture with thin dark lines between slats'],
      shadows: ['fine shadow lines between each slat', 'dark gaps creating rhythmic pattern', 'shadow grooves between horizontal strips', 'deep shadow beneath high plinth'],
      frames: ['thick wooden borders around slated fronts', 'substantial frames enclosing drawer groups', 'pronounced framing defining modules', 'solid maple frames with finger joints'],
      base: ['notably high recessed plinth', 'floating base effect with strong shadow', 'elevated foundation creating floor gap', 'dark recessed base about one-quarter drawer height'],
      hardware: ['handleless integrated pulls', 'routed grip in top edge', 'rabbeted design for tight seals', 'soft-close mechanisms', 'fully extendable drawers']
    },
    spatialRelationships: ['floating above floor on high plinth', 'raised with deep shadow creating strong horizontal line', 'hovering appearance with dark void beneath', 'cubic modules aligned in row', 'plinth height about quarter of drawer height'],
    materialCompatibility: {
      woods: ['rich walnut with swirling grain', 'honey oak with visible grain', 'pale ash with subtle grain', 'grey-brown smoked oak', 'light beech wood', 'natural maple'],
      woodDescriptions: {
        walnut: 'dark chocolate brown with swirling grain patterns',
        oak: 'golden honey-toned with straight grain',
        ash: 'pale blonde with subtle grain',
        smokedOak: 'grey-brown weathered appearance'
      },
      paints: ['velvety matte white', 'soft dove gray', 'muted sage green', 'deep charcoal', 'midnight navy'],
      metals: ['brushed stainless steel', 'matte black powder coated'],
      countertops: ['black granite with subtle sparkle', 'dark honed quartz', 'white marble with grey veining', 'polished concrete'],
      colorPalette: ['natural wood tones', 'maple', 'smoked oak', 'white ash', 'walnut']
    }
  },

  copenhagen: {
    id: 'copenhagen',
    name: 'Copenhagen',
    description: 'Based on Arne Munch\'s 1968 cubic furniture design. Features exposed wooden drawer boxes with no fronts, revealing interior construction and storage. Visible finger joints or dovetail joints at corners. Modules separated by wide gaps, mounted on slender legs or wall-mounted for floating appearance.',
    validation: {
      mustHave: [
        {
          category: 'mustHave',
          description: 'Exposed drawer boxes (no fronts)',
          keywords: ['exposed boxes', 'open drawers', 'no fronts', 'visible interior'],
          visualMarkers: ['box construction', 'interior visible']
        },
        {
          category: 'mustHave',
          description: 'Visible interior construction',
          keywords: ['visible construction', 'exposed joints', 'interior structure'],
          visualMarkers: ['joinery', 'structural elements']
        },
        {
          category: 'mustHave',
          description: 'Clear gaps between modules',
          keywords: ['module gaps', 'separate units', 'spacing', 'wide gaps'],
          visualMarkers: ['vertical spaces', 'separation']
        },
        {
          category: 'mustHave',
          description: 'Raised mounting (legs, wall, or low plinth)',
          keywords: ['raised', 'legs', 'wall-mounted', 'elevated'],
          visualMarkers: ['floor clearance', 'mounting system']
        },
        {
          category: 'mustHave',
          description: 'Natural wood interior visible',
          keywords: ['natural wood', 'wood interior', 'unpainted inside'],
          visualMarkers: ['wood texture', 'natural color']
        }
      ],
      shouldHave: [
        {
          category: 'shouldHave',
          description: 'Visible corner joints',
          keywords: ['dovetail joints', 'finger joints', 'visible corners'],
          visualMarkers: ['decorative joinery']
        },
        {
          category: 'shouldHave',
          description: 'Metal or wood legs',
          keywords: ['steel legs', 'hairpin legs', 'wooden legs', 'slender supports'],
          visualMarkers: ['thin supports', 'minimal base']
        },
        {
          category: 'shouldHave',
          description: 'Open, skeletal appearance',
          keywords: ['skeletal', 'minimal', 'open structure', 'lightweight'],
          visualMarkers: ['see-through', 'airy']
        },
        {
          category: 'shouldHave',
          description: 'Organized interior visible',
          keywords: ['organized', 'neat interior', 'visible storage'],
          visualMarkers: ['orderly contents']
        }
      ],
      mustNotHave: [
        {
          category: 'mustNotHave',
          description: 'Drawer fronts covering boxes',
          keywords: ['drawer fronts', 'covered boxes', 'hidden interior'],
          visualMarkers: ['closed fronts']
        },
        {
          category: 'mustNotHave',
          description: 'Continuous runs without gaps',
          keywords: ['continuous', 'no gaps', 'connected modules'],
          visualMarkers: ['unbroken runs']
        },
        {
          category: 'mustNotHave',
          description: 'Heavy, grounded appearance',
          keywords: ['heavy', 'grounded', 'bulky', 'solid base'],
          visualMarkers: ['massive appearance']
        }
      ]
    },
    promptFormula: 'Copenhagen Unoform kitchen with exposed [wood] drawer boxes showing interior construction, no drawer fronts revealing organized storage inside, visible [joint type] at corners aligned symmetrically, mounted on [mounting style], wide gaps between separate modules creating skeletal appearance, [lighting] highlighting natural wood interior, minimalist Danish design',
    primaryDescriptors: {
      exposure: ['exposed wooden drawer boxes', 'open drawer system showing contents', 'visible interior construction', 'skeletal minimalist structure'],
      construction: ['visible dovetail joints', 'exposed finger joints at corners', 'decorative joinery as design element', 'aligned symmetrical joints regardless of drawer size'],
      support: ['slender brushed steel legs', 'thin hairpin legs', 'matching wood leg frames', 'wall-mounted floating brackets', 'furniture-like legs'],
      mounting: {
        legs: 'modules on thin metal or wood legs creating furniture appearance',
        wall: 'wall-mounted modules floating with clear space below',
        plinth: 'low plinth option for subtle elevation'
      },
      gaps: ['wide gaps between modules', 'clear module separation', 'spacing about drawer-pull width', 'individual units not continuous']
    },
    spatialRelationships: ['floating on slender legs about one drawer-height off floor', 'wall-mounted with substantial clearance below', 'raised creating airy appearance', 'separate modules with gaps as wide as drawer pull', 'furniture-like stance', 'legs lift modules for easy cleaning beneath'],
    materialCompatibility: {
      woods: ['white oak with visible grain', 'pale ash wood', 'light birch', 'honey-toned beech', 'nordic pine', 'natural walnut'],
      woodDescriptions: {
        oak: 'light oak showing natural grain patterns',
        ash: 'white ash with straight subtle grain',
        walnut: 'rich walnut with prominent grain'
      },
      paints: [], // Copenhagen style uses natural wood finishes only
      finishes: ['natural wood with clear coat', 'raw wood with oil finish', 'matte varnish preserving texture'],
      metals: ['matte black powder coated steel', 'raw brushed steel', 'aged brass', 'stainless steel'],
      countertops: ['white Carrara marble', 'light oak to match drawers', 'polished concrete', 'stainless steel', 'travertine', 'granite', 'quartzite'],
      colorPalette: ['natural wood finishes', 'matte black accents', 'neutral tones']
    }
  },

  shaker: {
    id: 'shaker',
    name: 'Shaker',
    description: 'Nordic interpretation of American Shaker tradition. Features frame-and-panel doors with recessed flat center panels, simple clean lines without ornament. Painted in soft muted colors with small brass hardware. Mix of upper cabinets with doors and lower units with drawers.',
    validation: {
      mustHave: [
        {
          category: 'mustHave',
          description: 'Frame-and-panel door construction',
          keywords: ['frame-and-panel', 'framed doors', 'panel doors'],
          visualMarkers: ['visible frames', 'recessed centers']
        },
        {
          category: 'mustHave',
          description: 'Recessed center panel',
          keywords: ['recessed panel', 'inset panel', 'sunken center'],
          visualMarkers: ['depth variation', 'shadow lines']
        },
        {
          category: 'mustHave',
          description: 'Simple, clean lines',
          keywords: ['clean lines', 'simple', 'unadorned', 'minimal detail'],
          visualMarkers: ['straight edges', 'no ornamentation']
        },
        {
          category: 'mustHave',
          description: 'Visible frame around panel',
          keywords: ['visible frame', 'door frame', 'panel border'],
          visualMarkers: ['rectangular frames']
        },
        {
          category: 'mustHave',
          description: 'Traditional proportions',
          keywords: ['traditional', 'classic proportions', 'balanced'],
          visualMarkers: ['harmonious sizing']
        }
      ],
      shouldHave: [
        {
          category: 'shouldHave',
          description: 'Small brass or metal hardware',
          keywords: ['brass knobs', 'small pulls', 'metal hardware'],
          visualMarkers: ['small hardware']
        },
        {
          category: 'shouldHave',
          description: 'Painted in muted colors',
          keywords: ['muted colors', 'soft tones', 'painted finish'],
          visualMarkers: ['solid colors']
        },
        {
          category: 'shouldHave',
          description: 'Mix of doors and drawers',
          keywords: ['doors and drawers', 'mixed storage', 'variety'],
          visualMarkers: ['different door types']
        },
        {
          category: 'shouldHave',
          description: 'Balanced, symmetrical layout',
          keywords: ['symmetrical', 'balanced', 'orderly arrangement'],
          visualMarkers: ['visual balance']
        }
      ],
      mustNotHave: [
        {
          category: 'mustNotHave',
          description: 'Flat slab doors',
          keywords: ['flat doors', 'slab fronts', 'no panels'],
          visualMarkers: ['unbroken surfaces']
        },
        {
          category: 'mustNotHave',
          description: 'Ornate moldings',
          keywords: ['ornate', 'decorative molding', 'complex profiles'],
          visualMarkers: ['excessive detail']
        },
        {
          category: 'mustNotHave',
          description: 'High-gloss finishes',
          keywords: ['high-gloss', 'shiny', 'reflective'],
          visualMarkers: ['glossy surfaces']
        },
        {
          category: 'mustNotHave',
          description: 'Handleless design',
          keywords: ['handleless', 'no hardware', 'push-to-open'],
          visualMarkers: ['no visible handles']
        }
      ]
    },
    promptFormula: 'Shaker style Unoform kitchen with frame-and-panel cabinet doors, recessed flat center panels within rectangular frames, painted in [color] with [finish], small [hardware type] hardware, clean simple lines without ornament, mix of upper cabinet doors and lower drawers, [Nordic/traditional] interpretation of American Shaker, calm traditional aesthetic',
    primaryDescriptors: {
      doors: ['frame-and-panel construction', 'recessed flat panel doors', 'traditional panel within frame', 'rectangular frame with inset center'],
      proportions: ['balanced traditional proportions', 'harmonious cabinet sizing', 'medium-width frames around panels', 'classic American kitchen proportions'],
      hardware: ['small brass knobs', 'delicate brass pulls', 'understated traditional hardware', 'brass handles adding elegance'],
      construction: {
        doors: 'framed doors with recessed panels reflecting Shaker traditions',
        drawers: 'standard birch plywood or optional solid maple',
        features: 'open shelving units for display and accessibility'
      },
      frames: ['medium-width door frames', 'visible frame around each panel', 'not deeply recessed panels', 'subtle shadow lines']
    },
    spatialRelationships: ['traditional plinth-mounted for grounded appearance', 'sitting on standard base', 'classic kitchen heights', 'upper and lower cabinet arrangement', 'balanced symmetrical layout'],
    materialCompatibility: {
      woods: ['painted birch plywood', 'solid maple', 'painted MDF for smooth finish'],
      paints: ['muted sage green', 'soft dusty blue', 'warm dove gray', 'cream white', 'putty beige', 'Kieselgrau', 'Anthracite Grey', 'Olive'],
      paintFinishes: {
        matte: 'velvety non-reflective surface',
        eggshell: 'subtle sheen for durability',
        satin: 'gentle glow without high gloss'
      },
      metals: ['warm brass', 'antique pewter', 'oil-rubbed bronze', 'matte black'],
      countertops: ['white Carrara marble', 'maple butcher block', 'grey soapstone', 'honed granite'],
      colorPalette: ['Cream White', 'Kieselgrau', 'Anthracite Grey', 'Olive', 'soft Nordic tones']
    }
  },

  avantgarde: {
    id: 'avantgarde',
    name: 'Avantgarde',
    description: 'Architectural minimalism with completely flat, seamless surfaces. Features flush cabinet fronts with hairline gaps creating geometric grid pattern. No visible hardware with push-to-open or integrated handles. Tall cabinets often reach ceiling height. Looks more like architecture than traditional kitchen.',
    validation: {
      mustHave: [
        {
          category: 'mustHave',
          description: 'Completely flat, smooth surfaces',
          keywords: ['flat surfaces', 'smooth', 'seamless', 'uninterrupted'],
          visualMarkers: ['no texture', 'perfect planes']
        },
        {
          category: 'mustHave',
          description: 'Minimal gaps between all elements',
          keywords: ['minimal gaps', 'hairline gaps', 'tiny spaces'],
          visualMarkers: ['fine lines', 'precise gaps']
        },
        {
          category: 'mustHave',
          description: 'No visible hardware',
          keywords: ['no hardware', 'handleless', 'push-to-open'],
          visualMarkers: ['clean surfaces']
        },
        {
          category: 'mustHave',
          description: 'Grid-like arrangement',
          keywords: ['grid', 'geometric', 'regular pattern'],
          visualMarkers: ['geometric pattern']
        },
        {
          category: 'mustHave',
          description: 'Architectural appearance',
          keywords: ['architectural', 'monolithic', 'sculptural'],
          visualMarkers: ['building-like']
        }
      ],
      shouldHave: [
        {
          category: 'shouldHave',
          description: 'Floor-to-ceiling tall units',
          keywords: ['floor-to-ceiling', 'full-height', 'tall cabinets'],
          visualMarkers: ['vertical emphasis']
        },
        {
          category: 'shouldHave',
          description: 'Uniform gap width throughout',
          keywords: ['uniform gaps', 'consistent spacing', 'regular gaps'],
          visualMarkers: ['precision']
        },
        {
          category: 'shouldHave',
          description: 'Monochromatic color scheme',
          keywords: ['monochromatic', 'single color', 'minimal variation'],
          visualMarkers: ['color unity']
        },
        {
          category: 'shouldHave',
          description: 'Premium material appearance',
          keywords: ['premium', 'luxury materials', 'high-end finishes'],
          visualMarkers: ['quality surfaces']
        }
      ],
      mustNotHave: [
        {
          category: 'mustNotHave',
          description: 'Visible frames or borders',
          keywords: ['frames', 'borders', 'trim', 'edging'],
          visualMarkers: ['framing elements']
        },
        {
          category: 'mustNotHave',
          description: 'Traditional elements',
          keywords: ['traditional', 'classic', 'ornate', 'decorative'],
          visualMarkers: ['classical details']
        },
        {
          category: 'mustNotHave',
          description: 'Varied gap sizes',
          keywords: ['varied gaps', 'inconsistent spacing', 'irregular'],
          visualMarkers: ['uneven spacing']
        }
      ]
    },
    promptFormula: 'Avantgarde Unoform kitchen with completely flat seamless [finish] surfaces, thin hairline gaps creating precise geometric grid pattern, no visible hardware or handles, [height] cabinets with monolithic appearance, push-to-open mechanisms, [color] minimalist finish, architectural presence like modern building, dramatic lighting emphasizing pure geometry',
    primaryDescriptors: {
      surfaces: ['completely flat seamless surfaces', 'uninterrupted smooth planes', 'flawless facades without texture', 'mirror-smooth expanses'],
      gaps: ['hairline gaps between elements', 'precise uniform spacing', 'geometric grid pattern', 'minimal reveals creating rhythm', 'gaps thin as credit card'],
      effect: ['architectural monolithic presence', 'sculptural minimalist quality', 'building-like appearance', 'pure geometric forms'],
      hardware: {
        type: 'integrated handles or push-to-open mechanisms',
        appearance: 'no visible hardware maintaining clean lines',
        options: ['touch-latch', 'push-to-open', 'integrated groove handles']
      },
      modules: {
        tall: 'floor-to-ceiling cabinets up to 240cm',
        features: 'pocket doors for appliance concealment',
        arrangement: 'flush fronts with minimal gaps creating grid'
      }
    },
    spatialRelationships: ['floor-to-ceiling vertical emphasis', 'ground-hugging with minimal or no plinth', 'wall-to-wall continuous surfaces', 'floating elements with hidden mounting', 'everything aligns to invisible grid', 'gaps uniform throughout like architectural facade'],
    materialCompatibility: {
      woods: ['wood veneers in walnut or oak', 'laminate surfaces'],
      finishes: ['matte lacquer', 'high-gloss lacquer', 'anti-fingerprint coating'],
      paints: ['deep matte black', 'pure glacier white', 'concrete gray', 'anthracite charcoal', 'Cashmere Grey', 'Verde Comodoro', 'Blu Fes'],
      paintFinishes: {
        matte: 'completely non-reflective surface',
        semiMatte: 'slight sheen for depth',
        gloss: 'mirror-like reflective surface'
      },
      metals: ['integrated aluminum handles', 'hidden steel mechanisms', 'push-latch hardware'],
      countertops: ['ultra-thin porcelain slabs', 'engineered quartz', 'stainless steel', 'polished concrete', 'quartzite', 'granite'],
      colorPalette: ['Glacier White', 'Cashmere Grey', 'Verde Comodoro', 'Blu Fes', 'monochromatic schemes']
    }
  }
};

/**
 * Enhanced Prompt Templates for Each Style
 */
export const STYLE_PROMPT_TEMPLATES = {
  classic: {
    basic: 'Classic Unoform kitchen with horizontal slatted {wood} drawer fronts, thick wooden frames, high dark recessed base, handleless carved grip design, warm natural {wood} with visible grain, soft morning light from left, Danish minimalist heritage design',
    detailed: 'Classic Unoform kitchen featuring horizontal slatted {wood} drawer fronts with thin shadow gaps between each slat, thick {wood} frames surrounding each drawer module, notably high {color} recessed plinth creating deep shadow at floor, {number} equal-height drawers stacked in cubic modules, handleless design with routed finger grip carved into top edge, {countertop} countertop providing contrast, bright Scandinavian daylight, professional architectural photography'
  },
  copenhagen: {
    basic: 'Copenhagen Unoform kitchen with exposed wooden drawer boxes, no fronts showing interior construction, visible dovetail joints, mounted on thin brushed steel legs, floating appearance with shadow underneath, bright Scandinavian daylight',
    detailed: 'Copenhagen Unoform kitchen based on Arne Munch design, exposed {wood} drawer boxes with no fronts revealing organized interior, visible {jointType} joints aligned symmetrically at corners, mounted on {mounting}, wide gaps between separate modules creating skeletal appearance, natural {wood} interior with clear finish, {lighting}, minimalist Danish furniture aesthetic'
  },
  shaker: {
    basic: 'Shaker style Unoform kitchen, frame and panel cabinet doors, painted in muted sage green, small brass knob hardware, traditional yet minimal Nordic style, soft diffused lighting',
    detailed: 'Shaker style Unoform kitchen with frame-and-panel construction, {color} painted cabinet doors with recessed flat center panels, {hardware} hardware adding traditional touch, mix of upper cabinets with doors and lower drawer units, Nordic interpretation of American Shaker simplicity, {countertop} countertops, warm inviting atmosphere with soft natural light'
  },
  avantgarde: {
    basic: 'Avantgarde Unoform kitchen with flat seamless surfaces, no visible handles or hardware, thin geometric gaps between elements, matte charcoal grey finish, floor to ceiling tall cabinets, dramatic architectural lighting',
    detailed: 'Avantgarde Unoform kitchen with completely flat {finish} surfaces creating monolithic appearance, hairline gaps forming precise geometric grid, no visible hardware using push-to-open mechanisms, {height} cabinets in {color} finish, integrated appliances behind pocket doors, {countertop} worktop with minimal thickness, dramatic directional lighting emphasizing pure architectural form'
  }
};

/**
 * Lighting and Atmosphere Descriptors
 */
export const LIGHTING_ATMOSPHERE = {
  natural: {
    morning: 'soft morning light filtering through windows',
    nordic: 'bright Nordic daylight illuminating surfaces',
    diffused: 'diffused natural light creating soft shadows',
    golden: 'warm golden hour light'
  },
  artificial: {
    ambient: 'warm ambient lighting throughout',
    undercabinet: 'subtle under-cabinet LED glow',
    dramatic: 'dramatic spotlighting emphasizing texture',
    architectural: 'architectural lighting highlighting forms'
  },
  atmosphere: {
    minimal: 'pared-down essential minimalist atmosphere',
    warm: 'inviting cozy welcoming ambiance',
    sophisticated: 'refined elegant upscale environment',
    modern: 'contemporary fresh modern aesthetic'
  }
};

/**
 * Material Visual Descriptions
 */
export const MATERIAL_DESCRIPTIONS = {
  woods: {
    oak: 'honey-golden oak with prominent straight grain',
    ash: 'pale blonde ash with subtle grain pattern',
    walnut: 'rich chocolate walnut with swirling grain',
    smokedOak: 'grey-brown smoked oak with weathered appearance',
    maple: 'light maple with fine consistent grain',
    birch: 'creamy birch with delicate grain'
  },
  finishes: {
    matte: 'velvety matte surface with no reflection',
    satin: 'subtle satin sheen with gentle glow',
    natural: 'natural wood finish showing texture',
    lacquer: 'smooth lacquered surface',
    oiled: 'hand-rubbed oil finish enhancing grain'
  },
  metals: {
    brass: 'warm golden brass with subtle patina',
    steel: 'brushed stainless steel with fine texture',
    black: 'matte black powder-coated metal',
    bronze: 'oil-rubbed bronze with dark warmth'
  }
};