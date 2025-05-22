export type CabinetStyle = 
  | "Modern Flat-Panel"
  | "Classic Shaker"
  | "Minimalist Slab"
  | "Glass-Front Modern";

export type CabinetFinish = 
  | "Matte White"
  | "Natural Oak Wood"
  | "Black Gloss"
  | "Walnut Veneer";

export type CountertopMaterial = 
  | "White Marble"
  | "Black Granite"
  | "Light Oak Butcher Block"
  | "Concrete"
  | "Quartz";

export type FlooringType = 
  | "Hardwood Oak"
  | "Matte Gray Tile"
  | "Polished Concrete"
  | "Herringbone Parquet";

export type WallColor = 
  | "Bright White"
  | "Cream"
  | "Slate Gray"
  | "Navy Blue";

export type HardwareFinish = 
  | "Brushed Steel"
  | "Matte Black"
  | "Polished Brass"
  | "Chrome";

export const cabinetStyles: CabinetStyle[] = [
  "Modern Flat-Panel",
  "Classic Shaker",
  "Minimalist Slab",
  "Glass-Front Modern"
];

export const cabinetFinishes: CabinetFinish[] = [
  "Matte White",
  "Natural Oak Wood",
  "Black Gloss",
  "Walnut Veneer"
];

export const countertopMaterials: CountertopMaterial[] = [
  "White Marble",
  "Black Granite",
  "Light Oak Butcher Block",
  "Concrete",
  "Quartz"
];

export const flooringTypes: FlooringType[] = [
  "Hardwood Oak",
  "Matte Gray Tile",
  "Polished Concrete",
  "Herringbone Parquet"
];

export const wallColors: WallColor[] = [
  "Bright White",
  "Cream",
  "Slate Gray",
  "Navy Blue"
];

export const hardwareFinishes: HardwareFinish[] = [
  "Brushed Steel",
  "Matte Black",
  "Polished Brass",
  "Chrome"
];

export interface KitchenDesignSelections {
  cabinetStyle: CabinetStyle;
  cabinetFinish: CabinetFinish;
  countertop: CountertopMaterial;
  flooring: FlooringType;
  wallColor: WallColor;
  hardware: HardwareFinish;
}

export function generatePromptFromSelections(selections: KitchenDesignSelections): string {
  return `a kitchen with ${selections.cabinetStyle.toLowerCase()} cabinets painted ${selections.cabinetFinish.toLowerCase()}, ${selections.countertop.toLowerCase()} countertops, ${selections.flooring.toLowerCase()} flooring, ${selections.wallColor.toLowerCase()} walls, and ${selections.hardware.toLowerCase()} hardware`;
}