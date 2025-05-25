import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface InpaintState {
  // Canvas state
  isDrawing: boolean;
  brushSize: number;
  maskOpacity: number;
  maskBlur: number;
  maskData: string | null;
  
  // Tool state
  currentTool: 'brush' | 'eraser' | 'rectangle' | 'ellipse';
  brushHardness: number;
  
  // UI state
  showMaskPreview: boolean;
  maskPreviewMode: 'overlay' | 'side-by-side' | 'difference';
  
  // Mask library
  savedMasks: Array<{
    id: string;
    name: string;
    maskData: string;
    thumbnail: string;
    createdAt: string;
  }>;
}

interface InpaintActions {
  // Canvas actions
  setIsDrawing: (isDrawing: boolean) => void;
  setBrushSize: (size: number) => void;
  setMaskOpacity: (opacity: number) => void;
  setMaskBlur: (blur: number) => void;
  setMaskData: (data: string | null) => void;
  clearMask: () => void;
  
  // Tool actions
  setCurrentTool: (tool: InpaintState['currentTool']) => void;
  setBrushHardness: (hardness: number) => void;
  
  // UI actions
  toggleMaskPreview: () => void;
  setMaskPreviewMode: (mode: InpaintState['maskPreviewMode']) => void;
  
  // Mask library actions
  saveMask: (name: string, maskData: string, thumbnail: string) => void;
  loadMask: (id: string) => void;
  deleteMask: (id: string) => void;
  renameMask: (id: string, newName: string) => void;
  
  // Reset
  resetInpaintState: () => void;
}

const initialState: InpaintState = {
  isDrawing: false,
  brushSize: 50,
  maskOpacity: 0.5,
  maskBlur: 0,
  maskData: null,
  currentTool: 'brush',
  brushHardness: 0.8,
  showMaskPreview: true,
  maskPreviewMode: 'overlay',
  savedMasks: []
};

export const useInpaintStore = create<InpaintState & InpaintActions>()(
  devtools(
    immer((set, get) => ({
      ...initialState,
      
      // Canvas actions
      setIsDrawing: (isDrawing) => {
        set((state) => {
          state.isDrawing = isDrawing;
        });
      },
      
      setBrushSize: (size) => {
        set((state) => {
          state.brushSize = Math.max(1, Math.min(200, size));
        });
      },
      
      setMaskOpacity: (opacity) => {
        set((state) => {
          state.maskOpacity = Math.max(0, Math.min(1, opacity));
        });
      },
      
      setMaskBlur: (blur) => {
        set((state) => {
          state.maskBlur = Math.max(0, Math.min(50, blur));
        });
      },
      
      setMaskData: (data) => {
        set((state) => {
          state.maskData = data;
        });
      },
      
      clearMask: () => {
        set((state) => {
          state.maskData = null;
        });
      },
      
      // Tool actions
      setCurrentTool: (tool) => {
        set((state) => {
          state.currentTool = tool;
        });
      },
      
      setBrushHardness: (hardness) => {
        set((state) => {
          state.brushHardness = Math.max(0, Math.min(1, hardness));
        });
      },
      
      // UI actions
      toggleMaskPreview: () => {
        set((state) => {
          state.showMaskPreview = !state.showMaskPreview;
        });
      },
      
      setMaskPreviewMode: (mode) => {
        set((state) => {
          state.maskPreviewMode = mode;
        });
      },
      
      // Mask library actions
      saveMask: (name, maskData, thumbnail) => {
        set((state) => {
          const newMask = {
            id: `mask-${Date.now()}`,
            name,
            maskData,
            thumbnail,
            createdAt: new Date().toISOString()
          };
          state.savedMasks.push(newMask);
        });
      },
      
      loadMask: (id) => {
        const mask = get().savedMasks.find((m: any) => m.id === id);
        if (mask) {
          set((state) => {
            state.maskData = mask.maskData;
          });
        }
      },
      
      deleteMask: (id) => {
        set((state) => {
          state.savedMasks = state.savedMasks.filter((m: any) => m.id !== id);
        });
      },
      
      renameMask: (id, newName) => {
        set((state) => {
          const mask = state.savedMasks.find((m: any) => m.id === id);
          if (mask) {
            mask.name = newName;
          }
        });
      },
      
      // Reset
      resetInpaintState: () => {
        set((state) => {
          Object.assign(state, {
            ...initialState,
            savedMasks: state.savedMasks // Preserve saved masks
          });
        });
      }
    }))
  )
);